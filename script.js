// =====================================================
// FRANZ WORKOUT ASSISTANCE
// UPGRADED MAIN JAVASCRIPT
// =====================================================

const workoutContainer = document.getElementById("workoutContainer");
const resultsTitle = document.getElementById("resultsTitle");
const resultsDescription = document.getElementById("resultsDescription");
const recommendationResults = document.getElementById("recommendationResults");

let timerInterval = null;
let timerSeconds = 0;
let timerOriginalSeconds = 0;
let audioContext = null;

// Exercise timer
let exerciseInterval = null;
let exerciseSeconds = 0;
let exerciseOriginalSeconds = 0;

// Routine tracking
let activeRoutine = null;
let routineSteps = [];
let routineStepIndex = 0;
let routineCompletedSteps = 0;
let routineCurrentSet = 1;
let routineTotalSets = 1;
let routineIsRunning = false;

// Individual workout tracking
let activeWorkout = null;
let activeWorkoutSet = 1;
let activeWorkoutTotalSets = 1;


// =====================================================
// SAFETY / TEXT HELPERS
// =====================================================

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// TIME HELPERS
// =====================================================

function formatTime(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}

function parseRestSeconds(restText) {
    const text = String(restText || "").toLowerCase();

    const minutesMatch = text.match(
        /(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)/
    );

    const secondsMatch = text.match(
        /(\d+(?:\.\d+)?)\s*(?:sec|secs|second|seconds)/
    );

    let totalSeconds = 0;

    if (minutesMatch) {
        totalSeconds += Number(minutesMatch[1]) * 60;
    }

    if (secondsMatch) {
        totalSeconds += Number(secondsMatch[1]);
    }

    return Math.max(0, Math.round(totalSeconds));
}

function getExerciseDuration(workout) {
    if (Number(workout.durationSeconds) > 0) {
        return Number(workout.durationSeconds);
    }

    const text = String(workout.reps || "").toLowerCase();

    const minuteMatch = text.match(
        /(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)/
    );

    const secondMatch = text.match(
        /(\d+(?:\.\d+)?)\s*(?:sec|secs|second|seconds)/
    );

    if (minuteMatch || secondMatch) {
        return (
            Number(minuteMatch?.[1] || 0) * 60 +
            Number(secondMatch?.[1] || 0)
        );
    }

    return 0;
}

function isTimedWorkout(workout) {
    return (
        workout.exerciseType === "timed" ||
        getExerciseDuration(workout) > 0
    );
}


// =====================================================
// AUDIO
// =====================================================

function prepareAudio() {
    try {
        if (!audioContext) {
            const AudioContextClass =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioContextClass) {
                return;
            }

            audioContext = new AudioContextClass();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
    } catch (error) {
        console.log("Audio is not available in this browser.");
    }
}

function playBeep(frequency = 700, duration = 180, volume = 0.45) {
    try {
        prepareAudio();

        if (!audioContext) {
            return;
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
            frequency,
            audioContext.currentTime
        );

        const startTime = audioContext.currentTime;
        const endTime = startTime + duration / 1000;

        gain.gain.setValueAtTime(0.0001, startTime);

        gain.gain.exponentialRampToValueAtTime(
            volume,
            startTime + 0.015
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            endTime
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(endTime + 0.03);
    } catch (error) {
        console.log("Timer sound could not be played.");
    }
}

function playCompletionSound() {
    [
        { frequency: 800, delay: 0 },
        { frequency: 1000, delay: 250 },
        { frequency: 1200, delay: 500 }
    ].forEach(tone => {
        setTimeout(() => {
            playBeep(tone.frequency, 180);
        }, tone.delay);
    });
}


// =====================================================
// TIMER CLEANUP
// =====================================================

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function stopExerciseTimer() {
    if (exerciseInterval) {
        clearInterval(exerciseInterval);
        exerciseInterval = null;
    }
}

function stopAllTimers() {
    stopTimer();
    stopExerciseTimer();
}


// =====================================================
// DISPLAY WORKOUTS
// =====================================================

function displayWorkouts(category = "All") {
    if (!workoutContainer || !Array.isArray(workouts)) {
        return;
    }

    workoutContainer.innerHTML = "";

    const filteredWorkouts =
        category === "All"
            ? workouts
            : workouts.filter(workout => workout.category === category);

    if (resultsTitle) {
        resultsTitle.textContent =
            category === "All"
                ? "All Exercises"
                : `${category} Exercises`;
    }

    if (resultsDescription) {
        resultsDescription.textContent =
            category === "All"
                ? "Browse individual exercises or explore complete workout routines."
                : `Exercises selected from the ${category.toLowerCase()} category.`;
    }

    if (filteredWorkouts.length === 0) {
        workoutContainer.innerHTML = `
            <div class="no-workouts">
                <h3>No exercises found</h3>
                <p>There are currently no exercises in this category.</p>
            </div>
        `;

        return;
    }

    filteredWorkouts.forEach(workout => {
        const card = document.createElement("div");
        card.className = "workout-card";

        card.innerHTML = `
            <div class="workout-top">
                <span class="category">
                    ${escapeHtml(workout.category)}
                </span>

                <span class="difficulty">
                    ${escapeHtml(workout.difficulty)}
                </span>
            </div>

            <h3>${escapeHtml(workout.name)}</h3>

            <p class="target">
                <strong>Target:</strong>
                ${escapeHtml(workout.target)}
            </p>

            <p class="description">
                ${escapeHtml(workout.description)}
            </p>

            <div class="workout-details">
                <div>
                    <strong>${escapeHtml(workout.sets)}</strong>
                    <small>Sets</small>
                </div>

                <div>
                    <strong>${escapeHtml(workout.reps)}</strong>
                    <small>Reps / Time</small>
                </div>

                <div>
                    <strong>${escapeHtml(workout.rest)}</strong>
                    <small>Rest</small>
                </div>
            </div>

            <div class="benefit-box">
                <strong>FITNESS BENEFIT</strong>
                <p>${escapeHtml(workout.benefit)}</p>
            </div>

            <button
                class="start-button"
                type="button"
                data-workout-name="${escapeHtml(workout.name)}">
                VIEW AND START
            </button>
        `;

        card.querySelector(".start-button").addEventListener(
            "click",
            () => startWorkout(workout)
        );

        workoutContainer.appendChild(card);
    });
}


// =====================================================
// FILTER WORKOUTS
// =====================================================

function filterWorkouts(category) {
    displayWorkouts(category);

    document.querySelectorAll(".categories button").forEach(button => {
        button.classList.remove("active");

        if (
            button.textContent.trim().toLowerCase() ===
            String(category).toLowerCase()
        ) {
            button.classList.add("active");
        }
    });

    const results = document.getElementById("workoutResults");

    if (results) {
        setTimeout(() => {
            results.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 50);
    }
}


// =====================================================
// RECOMMENDATIONS
// =====================================================

const recommendationMap = {
    general: ["Cardio", "Legs", "Chest", "Core"],
    strength: ["Chest", "Back", "Legs", "Shoulders", "Arms"],
    cardio: ["Cardio"],
    upper: ["Chest", "Back", "Shoulders", "Arms"],
    lower: ["Legs"],
    core: ["Core"],
    mobility: ["Cardio", "Legs", "Core"]
};

function findRecommendedWorkouts() {
    const goal =
        document.getElementById("fitnessGoal")?.value || "general";

    const level =
        document.getElementById("fitnessLevel")?.value || "Beginner";

    const preferredCategories =
        recommendationMap[goal] || ["Cardio", "Legs"];

    let recommended = workouts.filter(workout =>
        preferredCategories.includes(workout.category) &&
        workout.difficulty === level
    );

    if (recommended.length < 3) {
        recommended = workouts.filter(workout =>
            preferredCategories.includes(workout.category) &&
            (
                workout.difficulty === level ||
                workout.difficulty === "Beginner"
            )
        );
    }

    recommended = recommended.slice(0, 5);

    if (!recommendationResults) {
        return;
    }

    const goalNames = {
        general: "General Fitness",
        strength: "Strength",
        cardio: "Cardio & Endurance",
        upper: "Upper Body",
        lower: "Lower Body",
        core: "Core",
        mobility: "Movement & Mobility"
    };

    recommendationResults.innerHTML = `
        <div class="recommendation-heading">
            <p>RECOMMENDED FOR YOU</p>

            <h3>
                ${escapeHtml(goalNames[goal] || "General Fitness")}
                ·
                ${escapeHtml(level)}
            </h3>
        </div>

        <div class="recommendation-grid">
            ${
                recommended.length
                    ? recommended.map(workout => `
                        <div class="recommendation-card">
                            <span>${escapeHtml(workout.category)}</span>
                            <h4>${escapeHtml(workout.name)}</h4>
                            <p>${escapeHtml(workout.target)}</p>

                            <button
                                type="button"
                                data-recommend-workout="${escapeHtml(workout.name)}">
                                VIEW WORKOUT
                            </button>
                        </div>
                    `).join("")
                    : `
                        <div class="no-workouts">
                            <h3>No recommendation available</h3>
                            <p>Try another goal or experience level.</p>
                        </div>
                    `
            }
        </div>
    `;

    recommendationResults
        .querySelectorAll("[data-recommend-workout]")
        .forEach(button => {
            button.addEventListener("click", () => {
                openWorkoutByName(button.dataset.recommendWorkout);
            });
        });
}

function openWorkoutByName(name) {
    const workout = workouts.find(item => item.name === name);

    if (workout) {
        startWorkout(workout);
    }
}


// =====================================================
// MODAL HELPERS
// =====================================================

function removeWorkoutModal() {
    stopAllTimers();

    const existingModal = document.getElementById("workoutModal");

    if (existingModal) {
        existingModal.remove();
    }

    document.body.classList.remove("modal-open");
}

function createWorkoutModal(content) {
    removeWorkoutModal();

    const modal = document.createElement("div");

    modal.id = "workoutModal";
    modal.className = "workout-modal";

    modal.innerHTML = `
        <div class="workout-modal-box">
            <button
                class="modal-close"
                type="button"
                aria-label="Close workout"
                onclick="closeWorkoutModal()">
                ×
            </button>

            <div class="modal-content">
                ${content}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add("modal-open");

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeWorkoutModal();
        }
    });

    return modal;
}


// =====================================================
// INDIVIDUAL WORKOUT
// =====================================================

function startWorkoutByIndex(index) {
    const workout = workouts[index];

    if (workout) {
        startWorkout(workout);
    }
}

function startWorkout(workout) {
    if (!workout) {
        return;
    }

    activeRoutine = null;
    routineSteps = [];
    routineStepIndex = 0;
    routineCompletedSteps = 0;

    activeWorkout = workout;

    activeWorkoutSet = 1;
    activeWorkoutTotalSets = Math.max(
        1,
        Number.parseInt(workout.sets, 10) || 1
    );

    const timed = isTimedWorkout(workout);
    const duration = getExerciseDuration(workout);
    const restSeconds = parseRestSeconds(
        workout.restSeconds ?? workout.rest
    );

    exerciseOriginalSeconds = duration;
    exerciseSeconds = duration;

    timerOriginalSeconds = restSeconds;
    timerSeconds = restSeconds;

    createWorkoutModal(`
        <p class="modal-brand">FRANZ WORKOUT ASSISTANCE</p>

        <h2>${escapeHtml(workout.name)}</h2>

        <div class="modal-line"></div>

        <p>
            <strong>Category:</strong>
            ${escapeHtml(workout.category)}
        </p>

        <p>
            <strong>Difficulty:</strong>
            ${escapeHtml(workout.difficulty)}
        </p>

        <div class="modal-target">
            <strong>TARGET</strong>
            <p>${escapeHtml(workout.target)}</p>
        </div>

        <div class="modal-description">
            <strong>EXERCISE DESCRIPTION</strong>
            <p>${escapeHtml(workout.description)}</p>
        </div>

        ${
            workout.instructions
                ? `
                    <div class="modal-description">
                        <strong>HOW TO PERFORM</strong>
                        <p>${escapeHtml(workout.instructions)}</p>
                    </div>
                `
                : ""
        }

        <div class="modal-benefit">
            <strong>FITNESS BENEFIT</strong>
            <p>${escapeHtml(workout.benefit)}</p>
        </div>

        <div class="modal-details">
            <div>
                <strong>${escapeHtml(workout.sets)}</strong>
                <span>SETS</span>
            </div>

            <div>
                <strong>${escapeHtml(workout.reps)}</strong>
                <span>REPS / TIME</span>
            </div>

            <div>
                <strong>${escapeHtml(workout.rest)}</strong>
                <span>REST</span>
            </div>
        </div>

        <div class="timer-box">
            <p>SET PROGRESS</p>

            <h3 id="setProgress">
                Set ${activeWorkoutSet} of ${activeWorkoutTotalSets}
            </h3>

            <div class="timer-buttons">
                <button
                    type="button"
                    onclick="completeWorkoutSet()">
                    COMPLETE SET
                </button>
            </div>
        </div>

        ${
            timed
                ? `
                    <div class="timer-box">
                        <p>EXERCISE TIMER</p>

                        <div id="exerciseTimerDisplay"
                             class="timer-display">
                            ${formatTime(duration)}
                        </div>

                        <div id="exerciseTimerStatus"
                             class="timer-status">
                            Ready
                        </div>

                        <div class="timer-buttons">
                            <button
                                type="button"
                                onclick="startExerciseTimer()">
                                START EXERCISE
                            </button>

                            <button
                                type="button"
                                class="timer-secondary"
                                onclick="pauseExerciseTimer()">
                                PAUSE
                            </button>

                            <button
                                type="button"
                                class="timer-secondary"
                                onclick="resetExerciseTimer()">
                                RESET
                            </button>
                        </div>
                    </div>
                `
                : `
                    <div class="timer-box">
                        <p>REPETITION GUIDE</p>
                        <h3>${escapeHtml(workout.reps)}</h3>
                        <p>Complete the repetitions using controlled movements.</p>
                    </div>
                `
        }

        <div class="timer-box">
            <p>REST TIMER</p>

            <div id="timerDisplay" class="timer-display">
                ${formatTime(restSeconds)}
            </div>

            <div id="timerStatus" class="timer-status">
                Ready
            </div>

            <div class="timer-buttons">
                <button type="button" onclick="startTimer()">
                    START REST
                </button>

                <button
                    type="button"
                    class="timer-secondary"
                    onclick="pauseTimer()">
                    PAUSE
                </button>

                <button
                    type="button"
                    class="timer-secondary"
                    onclick="resetTimer()">
                    RESET
                </button>
            </div>
        </div>

        <p class="form-reminder">
            Use proper form and a comfortable pace. Stop if you feel pain,
            dizziness, or unusual discomfort. Rest when needed.
        </p>

        <button
            type="button"
            class="modal-close-bottom"
            onclick="closeWorkoutModal()">
            CLOSE WORKOUT
        </button>
    `);

    updateTimerDisplay();
    updateExerciseTimerDisplay();
}

function completeWorkoutSet() {
    if (!activeWorkout) {
        return;
    }

    if (activeWorkoutSet < activeWorkoutTotalSets) {
        activeWorkoutSet++;

        const progress = document.getElementById("setProgress");

        if (progress) {
            progress.textContent =
                `Set ${activeWorkoutSet} of ${activeWorkoutTotalSets}`;
        }

        playBeep(750, 120);
    } else {
        const progress = document.getElementById("setProgress");

        if (progress) {
            progress.textContent = "All sets completed!";
        }

        playCompletionSound();
    }
}


// =====================================================
// EXERCISE TIMER
// =====================================================

function updateExerciseTimerDisplay() {
    const display = document.getElementById("exerciseTimerDisplay");
    const status = document.getElementById("exerciseTimerStatus");

    if (display) {
        display.textContent = formatTime(exerciseSeconds);
    }

    if (status && exerciseSeconds > 0) {
        status.textContent =
            exerciseInterval ? "Exercise in progress..." : "Ready";
    }
}

function startExerciseTimer() {
    if (exerciseInterval) {
        return;
    }

    if (exerciseOriginalSeconds <= 0) {
        return;
    }

    if (exerciseSeconds <= 0) {
        exerciseSeconds = exerciseOriginalSeconds;
    }

    prepareAudio();

    exerciseInterval = setInterval(() => {
        exerciseSeconds--;

        updateExerciseTimerDisplay();

        if (exerciseSeconds > 0 && exerciseSeconds <= 3) {
            playBeep(650, 120);
        }

        if (exerciseSeconds <= 0) {
            stopExerciseTimer();

            exerciseSeconds = 0;
            updateExerciseTimerDisplay();

            const status =
                document.getElementById("exerciseTimerStatus");

            if (status) {
                status.textContent = "EXERCISE TIME COMPLETE!";
            }

            playCompletionSound();
        }
    }, 1000);
}

function pauseExerciseTimer() {
    if (!exerciseInterval) {
        return;
    }

    stopExerciseTimer();

    const status = document.getElementById("exerciseTimerStatus");

    if (status) {
        status.textContent = "Paused";
    }
}

function resetExerciseTimer() {
    stopExerciseTimer();

    exerciseSeconds = exerciseOriginalSeconds;

    updateExerciseTimerDisplay();

    const status = document.getElementById("exerciseTimerStatus");

    if (status) {
        status.textContent = "Ready";
    }
}


// =====================================================
// REST TIMER
// =====================================================

function updateTimerDisplay() {
    const display = document.getElementById("timerDisplay");
    const status = document.getElementById("timerStatus");

    if (display) {
        display.textContent = formatTime(timerSeconds);
    }

    if (status && timerSeconds > 0) {
        status.textContent =
            timerInterval ? "Rest timer running..." : "Ready";
    }
}

function startTimer() {
    if (timerInterval) {
        return;
    }

    if (timerSeconds <= 0) {
        timerSeconds = timerOriginalSeconds;
    }

    if (timerSeconds <= 0) {
        const status = document.getElementById("timerStatus");

        if (status) {
            status.textContent = "No rest time configured.";
        }

        return;
    }

    prepareAudio();

    timerInterval = setInterval(() => {
        timerSeconds--;

        updateTimerDisplay();

        if (timerSeconds > 0 && timerSeconds <= 3) {
            playBeep(650, 120);
        }

        if (timerSeconds <= 0) {
            stopTimer();

            timerSeconds = 0;
            updateTimerDisplay();

            const status = document.getElementById("timerStatus");

            if (status) {
                status.textContent = "REST COMPLETE!";
            }

            playCompletionSound();
        }
    }, 1000);
}

function pauseTimer() {
    if (!timerInterval) {
        return;
    }

    stopTimer();

    const status = document.getElementById("timerStatus");

    if (status) {
        status.textContent = "Paused";
    }
}

function resetTimer() {
    stopTimer();

    timerSeconds = timerOriginalSeconds;

    updateTimerDisplay();

    const status = document.getElementById("timerStatus");

    if (status) {
        status.textContent = "Ready";
    }
}


// =====================================================
// WORKOUT ROUTINE INTERFACE
// =====================================================

function ensureRoutineInterface() {
    const workoutsSection = document.getElementById("workouts");

    if (!workoutsSection || document.getElementById("routineSection")) {
        return;
    }

    const section = document.createElement("div");

    section.id = "routineSection";
    section.className = "routine-section";

    section.innerHTML = `
        <div class="routine-heading">
            <p>TRAIN WITH A PLAN</p>
            <h2>Complete Workout Routines</h2>
            <p>
                Choose a routine and follow each exercise in order.
                You can also open any individual exercise above.
            </p>
        </div>

        <div id="routineContainer" class="routine-grid"></div>
    `;

    const workoutResults = document.getElementById("workoutResults");

    if (workoutResults) {
        workoutsSection.insertBefore(section, workoutResults);
    } else {
        workoutsSection.appendChild(section);
    }

    displayRoutines();
}

function getRoutineDifficulty(routine) {
    return routine.difficulty || "Beginner";
}

function getRoutineDescription(routine) {
    return (
        routine.description ||
        "Follow the exercises in this routine at a comfortable pace."
    );
}

function getRoutineSteps(routine) {
    return routine.steps || routine.exercises || [];
}

function displayRoutines() {
    const container = document.getElementById("routineContainer");

    if (!container || !Array.isArray(workoutRoutines)) {
        return;
    }

    container.innerHTML = "";

    if (workoutRoutines.length === 0) {
        container.innerHTML = `
            <p>No routines are available yet.</p>
        `;

        return;
    }

    workoutRoutines.forEach((routine, index) => {
        const steps = getRoutineSteps(routine);

        const card = document.createElement("div");

        card.className = "routine-card";

        card.innerHTML = `
            <span class="difficulty">
                ${escapeHtml(getRoutineDifficulty(routine))}
            </span>

            <h3>${escapeHtml(routine.name || "Workout Routine")}</h3>

            <p>${escapeHtml(getRoutineDescription(routine))}</p>

            <p>
                <strong>${steps.length}</strong>
                exercise steps
            </p>

            <button
                type="button"
                class="start-button"
                data-routine-index="${index}">
                START COMPLETE ROUTINE
            </button>
        `;

        card.querySelector("button").addEventListener("click", () => {
            startWorkoutRoutine(routine);
        });

        container.appendChild(card);
    });
}


// =====================================================
// ROUTINE STEP NORMALIZATION
// =====================================================

function normalizeRoutineStep(step) {
    if (typeof step === "string") {
        return {
            type: "exercise",
            name: step,
            sets: 1,
            durationSeconds: 0
        };
    }

    const type = String(step.type || "").toLowerCase();

    if (
        type === "rest" ||
        type === "recovery" ||
        step.isRest === true
    ) {
        return {
            type: "rest",
            name: step.name || "Recovery",
            durationSeconds:
                Number(step.durationSeconds) ||
                Number(step.seconds) ||
                parseRestSeconds(step.duration || step.rest || "30 seconds")
        };
    }

    return {
        type: "exercise",
        name:
            step.exercise ||
            step.exerciseName ||
            step.name ||
            "",
        sets: Math.max(1, Number(step.sets) || 1),
        durationSeconds:
            Number(step.durationSeconds) ||
            Number(step.seconds) ||
            0,
        restSeconds:
            Number(step.restSeconds) ||
            parseRestSeconds(step.rest || "")
    };
}


// =====================================================
// START A COMPLETE ROUTINE
// =====================================================

function startWorkoutRoutine(routine) {
    if (!routine) {
        return;
    }

    const rawSteps = getRoutineSteps(routine);

    routineSteps = rawSteps
        .map(normalizeRoutineStep)
        .filter(step => step.type === "rest" || step.name);

    if (routineSteps.length === 0) {
        alert("This routine does not contain any exercise steps yet.");
        return;
    }

    activeRoutine = routine;
    activeWorkout = null;

    routineStepIndex = 0;
    routineCompletedSteps = 0;
    routineCurrentSet = 1;
    routineTotalSets = 1;
    routineIsRunning = false;

    renderRoutineStep();
}

function renderRoutineStep() {
    stopAllTimers();

    if (routineStepIndex >= routineSteps.length) {
        showRoutineCompletion();
        return;
    }

    const step = routineSteps[routineStepIndex];

    const progressPercent = Math.round(
        (routineStepIndex / routineSteps.length) * 100
    );

    if (step.type === "rest") {
        renderRoutineRest(step, progressPercent);
        return;
    }

    const workout = workouts.find(item => item.name === step.name);

    if (!workout) {
        routineStepIndex++;
        renderRoutineStep();
        return;
    }

    activeWorkout = workout;

    routineCurrentSet = 1;

    routineTotalSets = Math.max(
        1,
        Number(step.sets) || Number(workout.sets) || 1
    );

    const duration =
        Number(step.durationSeconds) ||
        getExerciseDuration(workout);

    exerciseOriginalSeconds = duration;
    exerciseSeconds = duration;

    timerOriginalSeconds =
        Number(step.restSeconds) ||
        parseRestSeconds(workout.rest);

    timerSeconds = timerOriginalSeconds;

    const nextStep = routineSteps[routineStepIndex + 1];

    createWorkoutModal(`
        <p class="modal-brand">FRANZ WORKOUT ASSISTANCE</p>

        <p>COMPLETE WORKOUT ROUTINE</p>

        <h2>${escapeHtml(activeRoutine.name)}</h2>

        <div class="routine-progress-track">
            <div
                class="routine-progress-fill"
                style="width:${progressPercent}%">
            </div>
        </div>

        <p>
            Exercise ${routineStepIndex + 1}
            of ${routineSteps.length}
        </p>

        <h3>${escapeHtml(workout.name)}</h3>

        <p>
            <strong>Target:</strong>
            ${escapeHtml(workout.target)}
        </p>

        <p>${escapeHtml(workout.description)}</p>

        ${
            workout.instructions
                ? `<p><strong>Instructions:</strong>
                   ${escapeHtml(workout.instructions)}</p>`
                : ""
        }

        <div class="modal-details">
            <div>
                <strong>${routineCurrentSet}/${routineTotalSets}</strong>
                <span>SET</span>
            </div>

            <div>
                <strong>${escapeHtml(workout.reps)}</strong>
                <span>REPS / TIME</span>
            </div>

            <div>
                <strong>${escapeHtml(workout.rest)}</strong>
                <span>REST</span>
            </div>
        </div>

        <div class="timer-box">
            <p>SET PROGRESS</p>

            <h3 id="routineSetProgress">
                Set 1 of ${routineTotalSets}
            </h3>

            <div class="timer-buttons">
                <button
                    type="button"
                    onclick="completeRoutineSet()">
                    COMPLETE SET
                </button>
            </div>
        </div>

        ${
            duration > 0
                ? `
                    <div class="timer-box">
                        <p>EXERCISE TIMER</p>

                        <div id="exerciseTimerDisplay"
                             class="timer-display">
                            ${formatTime(duration)}
                        </div>

                        <div id="exerciseTimerStatus"
                             class="timer-status">
                            Ready
                        </div>

                        <div class="timer-buttons">
                            <button
                                type="button"
                                onclick="startExerciseTimer()">
                                START EXERCISE
                            </button>

                            <button
                                type="button"
                                class="timer-secondary"
                                onclick="pauseExerciseTimer()">
                                PAUSE
                            </button>

                            <button
                                type="button"
                                class="timer-secondary"
                                onclick="resetExerciseTimer()">
                                RESET
                            </button>
                        </div>
                    </div>
                `
                : `
                    <div class="timer-box">
                        <p>REPETITION GUIDE</p>
                        <h3>${escapeHtml(workout.reps)}</h3>
                    </div>
                `
        }

        <div class="timer-box">
            <p>REST TIMER</p>

            <div id="timerDisplay" class="timer-display">
                ${formatTime(timerSeconds)}
            </div>

            <div id="timerStatus" class="timer-status">
                Ready
            </div>

            <div class="timer-buttons">
                <button type="button" onclick="startTimer()">
                    START REST
                </button>

                <button
                    type="button"
                    class="timer-secondary"
                    onclick="pauseTimer()">
                    PAUSE
                </button>

                <button
                    type="button"
                    class="timer-secondary"
                    onclick="resetTimer()">
                    RESET
                </button>
            </div>
        </div>

        <div class="routine-next-step">
            <strong>UP NEXT</strong>
            <p>
                ${
                    nextStep
                        ? escapeHtml(nextStep.name || "Recovery")
                        : "Final step"
                }
            </p>
        </div>

        <div class="timer-buttons">
            <button
                type="button"
                class="timer-secondary"
                onclick="skipRoutineStep()">
                SKIP STEP
            </button>

            <button
                type="button"
                onclick="nextRoutineStep()">
                NEXT EXERCISE
            </button>
        </div>

        <p class="form-reminder">
            Follow your own pace, use proper form, and rest whenever needed.
        </p>

        <button
            type="button"
            class="modal-close-bottom"
            onclick="closeWorkoutModal()">
            EXIT ROUTINE
        </button>
    `);

    updateTimerDisplay();
    updateExerciseTimerDisplay();
}

function completeRoutineSet() {
    if (!activeRoutine) {
        return;
    }

    if (routineCurrentSet < routineTotalSets) {
        routineCurrentSet++;

        const progress = document.getElementById("routineSetProgress");

        if (progress) {
            progress.textContent =
                `Set ${routineCurrentSet} of ${routineTotalSets}`;
        }

        playBeep(750, 120);
    } else {
        const progress = document.getElementById("routineSetProgress");

        if (progress) {
            progress.textContent = "All sets completed!";
        }

        playCompletionSound();
    }
}

function renderRoutineRest(step, progressPercent) {
    const duration = Math.max(1, Number(step.durationSeconds) || 30);

    timerOriginalSeconds = duration;
    timerSeconds = duration;

    exerciseOriginalSeconds = 0;
    exerciseSeconds = 0;

    const nextStep = routineSteps[routineStepIndex + 1];

    createWorkoutModal(`
        <p class="modal-brand">FRANZ WORKOUT ASSISTANCE</p>

        <p>COMPLETE WORKOUT ROUTINE</p>

        <h2>${escapeHtml(activeRoutine.name)}</h2>

        <div class="routine-progress-track">
            <div
                class="routine-progress-fill"
                style="width:${progressPercent}%">
            </div>
        </div>

        <h3>Recovery Time</h3>

        <p>Take a short break and prepare for your next exercise.</p>

        <div class="timer-box">
            <p>REST TIMER</p>

            <div id="timerDisplay" class="timer-display">
                ${formatTime(duration)}
            </div>

            <div id="timerStatus" class="timer-status">
                Ready
            </div>

            <div class="timer-buttons">
                <button type="button" onclick="startTimer()">
                    START REST
                </button>

                <button
                    type="button"
                    class="timer-secondary"
                    onclick="pauseTimer()">
                    PAUSE
                </button>

                <button
                    type="button"
                    class="timer-secondary"
                    onclick="resetTimer()">
                    RESET
                </button>
            </div>
        </div>

        <p>
            <strong>UP NEXT:</strong>
            ${escapeHtml(nextStep?.name || "Finish routine")}
        </p>

        <button
            type="button"
            onclick="nextRoutineStep()">
            CONTINUE ROUTINE
        </button>

        <button
            type="button"
            class="modal-close-bottom"
            onclick="closeWorkoutModal()">
            EXIT ROUTINE
        </button>
    `);

    updateTimerDisplay();
}

function nextRoutineStep() {
    if (!activeRoutine) {
        return;
    }

    stopAllTimers();

    routineCompletedSteps++;
    routineStepIndex++;

    renderRoutineStep();
}

function skipRoutineStep() {
    if (!activeRoutine) {
        return;
    }

    stopAllTimers();

    routineStepIndex++;

    renderRoutineStep();
}

function showRoutineCompletion() {
    stopAllTimers();

    createWorkoutModal(`
        <p class="modal-brand">FRANZ WORKOUT ASSISTANCE</p>

        <h2>Routine Completed!</h2>

        <div class="modal-line"></div>

        <p>
            You reached the end of
            <strong>${escapeHtml(activeRoutine?.name || "your routine")}</strong>.
        </p>

        <p>Great job completing your planned workout session.</p>

        <button
            type="button"
            class="modal-close-bottom"
            onclick="closeWorkoutModal()">
            FINISH WORKOUT
        </button>
    `);

    playCompletionSound();
}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeWorkoutModal() {
    stopAllTimers();

    const modal = document.getElementById("workoutModal");

    if (modal) {
        modal.remove();
    }

    document.body.classList.remove("modal-open");

    activeRoutine = null;
    routineSteps = [];
    routineStepIndex = 0;
    routineIsRunning = false;

    activeWorkout = null;
}


// =====================================================
// ESC KEY
// =====================================================

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeWorkoutModal();
    }
});


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
    ensureRoutineInterface();
});

// Also initialize if this script runs after DOMContentLoaded.
ensureRoutineInterface();
displayWorkouts("All");
