from datetime import datetime, time
from uuid import uuid4
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from models.quiz import QuizSubmission, QuizSubmissionResponse, ChronotypeResult, QuizResponse
from models.chronotype import ChronotypeCreate, ChronotypeDataPoint
from dependencies import get_supabase

router = APIRouter(prefix="/quiz", tags=["Quiz"])


def analyze_chronotype(responses: List[QuizResponse]) -> ChronotypeResult:
    """
    Analyze quiz responses to determine chronotype.
    Returns Early Bird, Night Owl, or Intermediate classification.
    """
    # Scoring system for chronotype determination
    early_bird_score = 0
    night_owl_score = 0
    total_questions = 0
    
    analysis_details = {}
    
    for response in responses:
        question_id = response.question_id
        response_value = response.response_value
        
        # Skip the welcome question (question 0)
        if question_id == 0:
            continue
            
        total_questions += 1
        
        # Question 1: Performance after staying up late
        if question_id == 1:
            if response_value in ["very-poorly", "poorly"]:
                early_bird_score += 2
            elif response_value == "neither":
                early_bird_score += 1
                night_owl_score += 1
            elif response_value == "well":
                night_owl_score += 2
            analysis_details["late_night_performance"] = response_value
        
        # Question 2: Preferred wake time
        elif question_id == 2:
            if response_value in ["5am", "6am"]:
                early_bird_score += 3
            elif response_value == "7am":
                early_bird_score += 2
            elif response_value == "8am":
                early_bird_score += 1
                night_owl_score += 1
            elif response_value == "9am":
                night_owl_score += 2
            elif response_value == "10am":
                night_owl_score += 3
            analysis_details["preferred_wake_time"] = response_value
        
        # Question 3: Preferred bedtime
        elif question_id == 3:
            if response_value in ["8pm", "9pm"]:
                early_bird_score += 3
            elif response_value == "10pm":
                early_bird_score += 2
            elif response_value == "11pm":
                early_bird_score += 1
                night_owl_score += 1
            elif response_value == "12am":
                night_owl_score += 2
            elif response_value == "1am":
                night_owl_score += 3
            analysis_details["preferred_bedtime"] = response_value
        
        # Question 4: Morning alertness
        elif question_id == 4:
            if response_value == "very-alert":
                early_bird_score += 2
            elif response_value == "fairly-alert":
                early_bird_score += 1
            elif response_value == "slightly-alert":
                night_owl_score += 1
            elif response_value == "not-alert":
                night_owl_score += 2
            analysis_details["morning_alertness"] = response_value
        
        # Question 5: Peak performance time
        elif question_id == 5:
            if response_value == "8am-test":
                early_bird_score += 3
            elif response_value == "11am-test":
                early_bird_score += 1
                night_owl_score += 1
            elif response_value == "3pm-test":
                night_owl_score += 1
                early_bird_score += 1
            elif response_value == "7pm-test":
                night_owl_score += 3
            analysis_details["peak_performance_time"] = response_value
        
        # Question 6: Tiredness at 11pm
        elif question_id == 6:
            if response_value == "very-tired":
                early_bird_score += 2
            elif response_value == "fairly-tired":
                early_bird_score += 1
            elif response_value == "slightly-tired":
                night_owl_score += 1
            elif response_value == "not-tired":
                night_owl_score += 2
            analysis_details["evening_tiredness"] = response_value
        
        # Question 7: Sleep recovery pattern
        elif question_id == 7:
            if response_value == "wake-later":
                early_bird_score += 2
            elif response_value == "wake-later-sleep":
                early_bird_score += 1
                night_owl_score += 1
            elif response_value == "wake-much-later":
                night_owl_score += 2
            analysis_details["sleep_recovery"] = response_value
    
    # Determine chronotype based on scores
    if total_questions == 0:
        raise ValueError("No valid questions answered")
    
    # Calculate confidence based on score difference
    score_difference = abs(early_bird_score - night_owl_score)
    max_possible_difference = total_questions * 3  # Maximum score per question is 3
    confidence_score = min(score_difference / max_possible_difference, 1.0)
    
    # Classify chronotype
    if early_bird_score > night_owl_score + 2:
        chronotype_type = "Early Bird"
        recommended_schedule = {
            "bedtime": "9:00 PM - 10:00 PM",
            "wake_time": "5:00 AM - 6:00 AM"
        }
    elif night_owl_score > early_bird_score + 2:
        chronotype_type = "Night Owl"
        recommended_schedule = {
            "bedtime": "11:00 PM - 12:00 AM",
            "wake_time": "7:00 AM - 8:00 AM"
        }
    else:
        chronotype_type = "Intermediate"
        recommended_schedule = {
            "bedtime": "10:00 PM - 11:00 PM",
            "wake_time": "6:00 AM - 7:00 AM"
        }
    
    analysis_details.update({
        "early_bird_score": early_bird_score,
        "night_owl_score": night_owl_score,
        "total_questions": total_questions
    })
    
    return ChronotypeResult(
        chronotype_type=chronotype_type,
        confidence_score=confidence_score,
        analysis_details=analysis_details,
        recommended_sleep_schedule=recommended_schedule
    )


def create_initial_chronotype_data(chronotype_result: ChronotypeResult) -> List[ChronotypeDataPoint]:
    """
    Create initial chronotype data points based on quiz results.
    Generates a baseline energy curve for the determined chronotype.
    """
    data_points = []
    
    # Generate energy levels for different times of day based on chronotype
    if chronotype_result.chronotype_type == "Early Bird":
        # Early birds peak in morning, decline in evening
        energy_pattern = [
            (time(6, 0), 0.8),   # 6 AM - High energy
            (time(9, 0), 0.9),   # 9 AM - Peak energy
            (time(12, 0), 0.7),  # 12 PM - Good energy
            (time(15, 0), 0.6),  # 3 PM - Moderate energy
            (time(18, 0), 0.4),  # 6 PM - Lower energy
            (time(21, 0), 0.2),  # 9 PM - Low energy
        ]
    elif chronotype_result.chronotype_type == "Night Owl":
        # Night owls start low, peak in evening
        energy_pattern = [
            (time(6, 0), 0.2),   # 6 AM - Low energy
            (time(9, 0), 0.3),   # 9 AM - Still low
            (time(12, 0), 0.5),  # 12 PM - Building energy
            (time(15, 0), 0.7),  # 3 PM - Good energy
            (time(18, 0), 0.8),  # 6 PM - High energy
            (time(21, 0), 0.9),  # 9 PM - Peak energy
        ]
    else:  # Intermediate
        # Intermediate types have more balanced energy
        energy_pattern = [
            (time(6, 0), 0.4),   # 6 AM - Moderate energy
            (time(9, 0), 0.7),   # 9 AM - Good energy
            (time(12, 0), 0.8),  # 12 PM - Peak energy
            (time(15, 0), 0.7),  # 3 PM - Good energy
            (time(18, 0), 0.5),  # 6 PM - Moderate energy
            (time(21, 0), 0.3),  # 9 PM - Lower energy
        ]
    
    # Create data points
    for time_of_day, predicted_energy in energy_pattern:
        data_point = ChronotypeDataPoint(
            time_of_day=time_of_day,
            predicted_energy_level=predicted_energy,
            actual_energy_level=predicted_energy,  # Initially same as predicted
            difference_from_actual=0.0,  # No difference initially
            context={"source": "initial_quiz", "chronotype": chronotype_result.chronotype_type}
        )
        data_points.append(data_point)
    
    return data_points


@router.post("/submit", response_model=QuizSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_quiz(
    payload: QuizSubmission,
    db: Client = Depends(get_supabase),
):
    """
    Process quiz submission and determine chronotype.
    Creates initial chronotype data based on quiz results.
    """
    try:
        # Analyze quiz responses to determine chronotype
        chronotype_result = analyze_chronotype(payload.responses)
        
        # Generate quiz ID
        quiz_id = str(uuid4())
        
        # Create initial chronotype data
        initial_data_points = create_initial_chronotype_data(chronotype_result)
        
        # Create chronotype record
        chronotype_id = str(uuid4())
        chronotype_payload = ChronotypeCreate(
            user_id=payload.user_id,
            chronotype_id=chronotype_id,
            data_points=initial_data_points
        )
        
        # Store chronotype in database
        chronotype_record = chronotype_payload.model_dump()
        chronotype_record["data_points"] = [dp.model_dump() for dp in initial_data_points]
        chronotype_record["created_at"] = datetime.utcnow().isoformat()
        
        db.table("chronotypes").insert(chronotype_record).execute()
        
        # Store quiz responses (optional - for future reference)
        quiz_record = {
            "quiz_id": quiz_id,
            "user_id": payload.user_id,
            "responses": [r.model_dump() for r in payload.responses],
            "chronotype_result": chronotype_result.model_dump(),
            "submitted_at": datetime.utcnow().isoformat()
        }
        
        # Note: You might want to create a separate 'quiz_submissions' table
        # For now, we'll just return the result
        
        return QuizSubmissionResponse(
            quiz_id=quiz_id,
            chronotype_result=chronotype_result,
            chronotype_id=chronotype_id,
            message=f"Quiz completed! You are classified as a {chronotype_result.chronotype_type} with {chronotype_result.confidence_score:.1%} confidence."
        )
        
    except Exception as exc:
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing quiz: {exc}"
        )
