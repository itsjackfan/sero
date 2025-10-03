from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Header, HTTPException, status
from supabase import Client

from backend.dependencies import get_supabase
from backend.models import (
    ChronotypeSummary,
    QuizAttemptCreate,
    QuizAttemptRecord,
    QuizDefinition,
    QuizQuestion,
    QuizResponsePayload,
    QuizSubmissionRequest,
    QuizSubmissionResult,
)

router = APIRouter(prefix="/quiz", tags=["Quiz"])


_CHRONOTYPES = ["lion", "bear", "wolf", "dolphin"]


_question_weights: Dict[str, Dict[str, Dict[str, float]]] = {
    "sleep_deprivation_performance": {
        "very-poorly": {"lion": 0.9, "bear": 0.6},
        "poorly": {"lion": 0.7, "bear": 0.5},
        "neither": {"bear": 0.5, "dolphin": 0.4},
        "well": {"wolf": 0.7, "dolphin": 0.6},
    },
    "preferred_wake_time": {
        "5am": {"lion": 1.0},
        "6am": {"lion": 0.9},
        "7am": {"bear": 0.8, "lion": 0.5},
        "8am": {"bear": 0.7, "dolphin": 0.4},
        "9am": {"wolf": 0.7, "bear": 0.4},
        "10am": {"wolf": 1.0, "dolphin": 0.5},
    },
    "preferred_bed_time": {
        "8pm": {"lion": 0.9},
        "9pm": {"lion": 0.8},
        "10pm": {"bear": 0.7, "dolphin": 0.4},
        "11pm": {"bear": 0.6, "wolf": 0.4},
        "12am": {"wolf": 0.7, "dolphin": 0.5},
        "1am": {"wolf": 0.9, "dolphin": 0.6},
    },
    "morning_alertness": {
        "not-alert": {"wolf": 0.8, "dolphin": 0.6},
        "slightly-alert": {"bear": 0.4, "wolf": 0.6, "dolphin": 0.4},
        "fairly-alert": {"bear": 0.7, "lion": 0.6},
        "very-alert": {"lion": 0.9},
    },
    "exam_time_preference": {
        "8am-test": {"lion": 0.9, "bear": 0.6},
        "11am-test": {"bear": 0.8, "lion": 0.5},
        "3pm-test": {"bear": 0.6, "wolf": 0.6, "dolphin": 0.4},
        "7pm-test": {"wolf": 0.9, "dolphin": 0.7},
    },
    "bedtime_tiredness": {
        "not-tired": {"wolf": 0.7, "dolphin": 0.5},
        "slightly-tired": {"bear": 0.7, "wolf": 0.4},
        "fairly-tired": {"bear": 0.8},
        "very-tired": {"lion": 0.8, "dolphin": 0.4},
    },
    "late_night_recovery": {
        "wake-later": {"lion": 0.6, "dolphin": 0.4},
        "wake-later-sleep": {"bear": 0.6, "lion": 0.4},
        "wake-much-later": {"wolf": 0.9, "bear": 0.5},
    },
}


_sleep_schedule: Dict[str, Dict[str, str]] = {
    "lion": {"bedtime": "9:00 PM - 10:00 PM", "wake_time": "5:00 AM - 6:00 AM"},
    "bear": {"bedtime": "10:30 PM - 11:30 PM", "wake_time": "7:00 AM - 8:00 AM"},
    "wolf": {"bedtime": "11:30 PM - 12:30 AM", "wake_time": "7:30 AM - 8:30 AM"},
    "dolphin": {"bedtime": "11:00 PM - 12:00 AM", "wake_time": "6:30 AM - 7:30 AM"},
}


_recommendations: Dict[str, Dict[str, str]] = {
    "lion": {
        "focus": "Schedule demanding work before noon when your energy peaks.",
        "evening": "Wind down with relaxing routines to protect early bedtime.",
    },
    "bear": {
        "focus": "Anchor deep work mid-morning and maintain consistent sleep windows.",
        "evening": "Plan lighter tasks after 6 PM as energy tapers.",
    },
    "wolf": {
        "focus": "Reserve creative/problem-solving sessions late afternoon or evening.",
        "morning": "Give yourself gradual ramp-up mornings with light tasks first.",
    },
    "dolphin": {
        "focus": "Use structured routines and micro-rests to manage lighter sleep.",
        "evening": "Avoid heavy stimulation before bed to improve sleep quality.",
    },
}


async def _fetch_quiz_definition(db: Client, *, quiz_id: str | None = None) -> QuizDefinition:
    query = db.table("quiz").select("id,title,version,quiz_question(*)")
    if quiz_id:
        query = query.eq("id", quiz_id)
    query = query.order("version", desc=True).limit(1)

    response = query.execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Quiz not found")

    record = response.data[0]
    questions_data = sorted(record["quiz_question"], key=lambda q: q["order_index"])

    questions: List[QuizQuestion] = []
    for row in questions_data:
        options = row.get("options") or []
        questions.append(
            QuizQuestion(
                id=row["id"],
                question_key=row["question_key"],
                prompt=row["prompt"],
                question_type=row["question_type"],
                points=float(row.get("points") or 1),
                order_index=row["order_index"],
                options=options,
            )
        )

    return QuizDefinition(id=record["id"], title=record["title"], version=record["version"], questions=questions)


def _weights_for_answer(question_key: str, answer_value: str) -> Dict[str, float]:
    return _question_weights.get(question_key, {}).get(answer_value, {})


def _normalize_scores(scores: Dict[str, float]) -> Dict[str, float]:
    total = sum(scores.values()) or 1.0
    return {chronotype: round(value / total, 4) for chronotype, value in scores.items()}


def _determine_chronotype(scores: Dict[str, float]) -> str:
    ordered = sorted(scores.items(), key=lambda item: item[1], reverse=True)
    if not ordered:
        return "bear"
    top_type, top_score = ordered[0]
    if len(ordered) > 1:
        second_score = ordered[1][1]
        if top_score - second_score < 0.1:
            return "bear"
    return top_type


def _score_responses(quiz: QuizDefinition, responses: List[QuizResponsePayload]) -> Dict[str, Any]:
    scores: Dict[str, float] = {name: 0.0 for name in _CHRONOTYPES}
    per_question: Dict[str, Dict[str, float]] = {}

    question_by_id = {question.id: question for question in quiz.questions}
    
    for response in responses:
        question = question_by_id.get(response.question_id)
        if not question:
            raise HTTPException(status_code=400, detail=f"Unknown question id {response.question_id}")

        weights = _weights_for_answer(question.question_key, str(response.answer_value))
        per_question[question.question_key] = weights
        for chronotype, weight in weights.items():
            scores[chronotype] += weight

    normalized = _normalize_scores(scores)
    chronotype_key = _determine_chronotype(normalized)

    chronotype = ChronotypeSummary(
        chronotype_type=chronotype_key.capitalize(),
        confidence_score=round(normalized.get(chronotype_key, 0.0), 3),
        recommended_sleep_schedule=_sleep_schedule.get(chronotype_key, {}),
        analysis_details={
            "scores": normalized,
            "raw_scores": scores,
            "question_breakdown": per_question,
            "recommendations": _recommendations.get(chronotype_key, {}),
        },
    )

    return {
        "chronotype": chronotype,
        "normalized_scores": normalized,
        "raw_scores": scores,
        "question_breakdown": per_question,
    }


def _score_quiz(quiz: QuizDefinition, responses: List[QuizResponsePayload]) -> Dict[str, Any]:
    return _score_responses(quiz, responses)


async def _persist_attempt(
    db: Client,
    attempt: QuizAttemptCreate,
    normalized_scores: Dict[str, float],
    breakdown: Dict[str, Dict[str, float]],
    chronotype: ChronotypeSummary | None,
    raw_scores: Dict[str, float],
) -> QuizAttemptRecord:
    summary_map = {
        **attempt.summary,
        "chronotype": chronotype.chronotype_type if chronotype else None,
        "confidence": chronotype.confidence_score if chronotype else None,
        "scores": normalized_scores,
        "raw_scores": raw_scores,
        "question_breakdown": breakdown,
    }

    attempt_row = {
        "quiz_id": attempt.quiz_id,
        "quiz_version": attempt.quiz_version,
        "user_id": attempt.user_id,
        "summary": summary_map,
    }
    attempt_result = db.table("quiz_attempt").insert(attempt_row).execute()
    if not attempt_result.data:
        raise HTTPException(status_code=500, detail="Failed to store quiz attempt")

    attempt_id = attempt_result.data[0]["id"]

    response_rows = [
        {
            "attempt_id": attempt_id,
            "question_id": response.question_id,
            "answer_value": response.answer_value,
            "elapsed_ms": response.elapsed_ms,
            "weights": response.weights,
        }
        for response in attempt.responses
    ]

    if response_rows:
        db.table("quiz_response").insert(response_rows).execute()

    return QuizAttemptRecord(
        id=attempt_id,
        quiz_id=attempt.quiz_id,
        user_id=attempt.user_id,
        quiz_version=attempt.quiz_version,
        summary=summary_map,
        submitted_at=datetime.utcnow(),
    )


@router.get("", response_model=QuizDefinition)
async def get_active_quiz(db: Client = Depends(get_supabase)) -> QuizDefinition:
    return await _fetch_quiz_definition(db)


@router.post("/submit", response_model=QuizSubmissionResult, status_code=status.HTTP_201_CREATED)
async def submit_quiz(
    payload: QuizSubmissionRequest,
    db: Client = Depends(get_supabase),
    authorization: str | None = Header(default=None),
) -> QuizSubmissionResult:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")

    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization token")

    try:
        db.postgrest.auth(token)
        user_result = db.auth.get_user(token)
    except Exception as exc:  # pragma: no cover - defensive guard
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid authorization token: {exc}")

    user_data = getattr(user_result, "user", None)
    user_id = getattr(user_data, "id", None)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not resolve authenticated user")

    quiz = await _fetch_quiz_definition(db, quiz_id=payload.quiz_id)
    if payload.quiz_version != quiz.version:
        raise HTTPException(status_code=409, detail={"message": "Quiz version mismatch", "quizVersion": quiz.version})

    if len(payload.responses) != len(quiz.questions):
        raise HTTPException(status_code=400, detail="Every question must be answered")

    scoring = _score_quiz(quiz, payload.responses)
    chronotype: ChronotypeSummary = scoring["chronotype"]

    enriched_responses = []
    question_by_id = {question.id: question for question in quiz.questions}

    for response in payload.responses:
        question = question_by_id[response.question_id]
        enriched_responses.append(
            QuizResponsePayload(
                question_id=response.question_id,
                answer_value=response.answer_value,
                elapsed_ms=response.elapsed_ms,
                weights=_weights_for_answer(question.question_key, str(response.answer_value)),
            )
        )

    attempt = QuizAttemptCreate(
        quiz_id=quiz.id,
        quiz_version=quiz.version,
        user_id=user_id,
        summary={"chronotype": chronotype.chronotype_type},
        responses=enriched_responses,
    )

    attempt_record = await _persist_attempt(
        db,
        attempt,
        scoring["normalized_scores"],
        scoring["question_breakdown"],
        chronotype,
        scoring["raw_scores"],
    )

    return QuizSubmissionResult(
        attempt=attempt_record,
        responses=enriched_responses,
        chronotype=chronotype,
        raw_scores=scoring["raw_scores"],
        question_breakdown=scoring["question_breakdown"],
        )
