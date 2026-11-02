// =====================================================
// FRANZ WORKOUT ASSISTANCE
// COMPLETE MAIN JAVASCRIPT
// =====================================================

// This file handles workouts, recommendations, modals,
// individual exercise timers, rest timers, and routines.
//
// Keep workouts.js loaded before this file.
// Keep your authentication, profile, BMI, and admin
// scripts in index.html unchanged.
// =====================================================


// =====================================================
// DOM ELEMENTS
// =====================================================

const workoutContainer = document.getElementById("workoutContainer");
const resultsTitle = document.getElementById("resultsTitle");
const resultsDescription = document.getElementById("resultsDescription");
const recommendationResults = document.getElementById("recommendationResults");


// =====================================================
// GLOBAL STATE
// =====================================================

let activeWorkout = null;
let activeRoutine = null;

let routineSteps = [];
let routineStepIndex = 0;
let routineCompletedSteps = 0;

let routineCurrentSet = 1;
let routineTotalSets = 1;

let timerInterval = null;
let timerSeconds = 0;
let timerOriginalSeconds = 0;

let exerciseTimerInterval = null;
let exerciseSeconds = 0;
let exerciseOriginalSeconds = 0;

let individualCurrentSet = 1;
let individualTotalSets = 1;

let timerIsRunning = false;
let exerciseTimerIsRunning = false;

let routineIsRunning = false;
let workoutModalElement = null;


// =====================================================
// GENERAL HELPERS
// =====================================================

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[character];
    });
}


function formatTime(totalSeconds) {
    const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );
}


function parseRestSeconds(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return Math.max(0, Math.floor(value));
    }

    if (value === null || value === undefined || value === "") {
        return 0;
    }

    const text = String(value).toLowerCase().trim();

    if (/as needed|as required|none|no rest/.test(text)) {
        return 0;
    }

    const minutesMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:minutes?|mins?|m)\b/);

    if (minutesMatch) {
        return Math.round(Number(minutesMatch[1]) * 60);
    }

    const secondsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:seconds?|secs?|s)\b/);

    if (secondsMatch) {
        return Math.round(Number(secondsMatch[1]));
    }

    const numberMatch = text.match(/\d+(?:\.\d+)?/);

    if (numberMatch) {
        return Math.round(Number(numberMatch[0]));
    }

    return 0;
}


function getExerciseDuration(workout) {
    if (!workout) {
        return 0;
    }

    if (Number(workout.durationSeconds) > 0) {
        return Number(workout.durationSeconds);
    }

    if (Number(workout.duration) > 0) {
        return Number(workout.duration);
    }

    return 0;
}


function getWorkoutRestSeconds(workout) {
    if (!workout) {
        return 0;
    }

    if (
        workout.restSeconds !== undefined &&
        workout.restSeconds !== null &&
        workout.restSeconds !== ""
    ) {
        return parseRestSeconds(workout.restSeconds);
    }

    return parseRestSeconds(workout.rest);
}


function getWorkoutDifficulty(workout) {
    return String(workout?.difficulty || "Beginner");
}


function getWorkoutCategory(workout) {
    return String(workout?.category || "General");
}


function getWorkoutByNameSafe(name) {
    if (typeof getWorkoutByName === "function") {
        const found = getWorkoutByName(name);

        if (found) {
            return found;
        }
    }

    if (!Array.isArray(workouts)) {
        return null;
    }

    return workouts.find(function (workout) {
        return String(workout.name).toLowerCase() ===
            String(name).toLowerCase();
    }) || null;
}


function playBeep(frequency = 750, duration = 150) {
    try {
        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            return;
        }

        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;

        gain.gain.value = 0.08;

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start();

        oscillator.stop(
            audioContext.currentTime + duration / 1000
        );

        oscillator.onended = function () {
            audioContext.close().catch(function () {});
        };
    } catch (error) {
        console.warn("Audio could not play:", error);
    }
}


function playCompletionSound() {
    playBeep(700, 120);

    setTimeout(function () {
        playBeep(900, 160);
    }, 180);

    setTimeout(function () {
        playBeep(1100, 220);
    }, 400);
}


// =====================================================
// TIMER CLEANUP
// =====================================================

function stopRestTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    timerIsRunning = false;
}


function stopExerciseTimer() {
    if (exerciseTimerInterval !== null) {
        clearInterval(exerciseTimerInterval);
        exerciseTimerInterval = null;
    }

    exerciseTimerIsRunning = false;
}


function stopAllTimers() {
    stopRestTimer();
    stopExerciseTimer();
}


// =====================================================
// WORKOUT DISPLAY
// =====================================================

function displayWorkouts(category = "All") {
    if (!workoutContainer) {
        return;
    }

    if (!Array.isArray(workouts)) {
        workoutContainer.innerHTML =
            "<p>Workout data could not be loaded.</p>";
        return;
    }

    const selectedCategory = String(category || "All")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const categoryAliases = {
        all: [],
        chest: ["chest"],
        back: ["back"],
        legs: ["leg", "legs", "lowerbody"],
        cardio: ["cardio", "endurance"],
        shoulders: ["shoulder", "shoulders"],
        arms: ["arm", "arms", "biceps", "triceps"],
        core: ["core", "abs", "abdominal"]
    };

    const searchTerms = categoryAliases[selectedCategory] || [
        selectedCategory
    ];

    const filteredWorkouts = workouts.filter(function (workout) {
        if (selectedCategory === "all" || selectedCategory === "") {
            return true;
        }

        const workoutCategory = String(workout.category || "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

        const workoutName = String(workout.name || "")
            .toLowerCase();

        const workoutTarget = String(workout.target || "")
            .toLowerCase();

        return searchTerms.some(function (term) {
            return (
                workoutCategory.includes(term) ||
                workoutName.includes(term) ||
                workoutTarget.includes(term)
            );
        });
    });

    workoutContainer.innerHTML = "";

    if (filteredWorkouts.length === 0) {
        workoutContainer.innerHTML = `
            <div class="no-workouts-message">
                <h3>No workouts found</h3>
                <p>
                    There are currently no exercises matching
                    this category. Try another category.
                </p>

                <button
                    type="button"
                    onclick="filterWorkouts('All')">
                    VIEW ALL WORKOUTS
                </button>
            </div>
        `;
    } else {
        filteredWorkouts.forEach(function (workout) {
            const originalIndex = workouts.indexOf(workout);

            const card = document.createElement("article");

            card.className = "workout-card";
            card.tabIndex = 0;
            card.setAttribute("role", "button");

            card.setAttribute(
                "aria-label",
                "Open workout: " + workout.name
            );

            card.innerHTML = `
                <div class="workout-card-content">

                    <span class="workout-category">
                        ${escapeHtml(workout.category || "General")}
                    </span>

                    <span class="workout-difficulty">
                        ${escapeHtml(workout.difficulty || "Beginner")}
                    </span>

                    <h3>${escapeHtml(workout.name)}</h3>

                    <p class="workout-target">
                        <strong>Target:</strong>
                        ${escapeHtml(workout.target || "General fitness")}
                    </p>

                    <p class="workout-description">
                        ${escapeHtml(workout.description || "")}
                    </p>

                    <div class="workout-card-details">
                        <span>
                            <strong>Sets:</strong>
                            ${escapeHtml(workout.sets ?? 1)}
                        </span>

                        <span>
                            <strong>Reps / Time:</strong>
                            ${escapeHtml(workout.reps || "Follow instructions")}
                        </span>
                    </div>

                    <button
                        type="button"
                        class="start-workout-button">
                        OPEN EXERCISE
                    </button>

                </div>
            `;

            card.addEventListener("click", function (event) {
                if (event.target.closest("button")) {
                    return;
                }

                startWorkoutByIndex(originalIndex);
            });

            card.addEventListener("keydown", function (event) {
                if (
                    event.target === card &&
                    (event.key === "Enter" || event.key === " ")
                ) {
                    event.preventDefault();
                    startWorkoutByIndex(originalIndex);
                }
            });

            card.querySelector(".start-workout-button")
                .addEventListener("click", function (event) {
                    event.stopPropagation();
                    startWorkoutByIndex(originalIndex);
                });

            workoutContainer.appendChild(card);
        });
    }

    if (resultsTitle) {
        resultsTitle.textContent =
            selectedCategory === "all"
                ? "All Exercises"
                : category + " Exercises";
    }

    if (resultsDescription) {
        resultsDescription.textContent =
            filteredWorkouts.length +
            " exercise" +
            (filteredWorkouts.length === 1 ? "" : "s") +
            " available.";
    }
}
// =====================================================
// CATEGORY FILTERING
// =====================================================

function filterWorkouts(category) {
    displayWorkouts(category || "All");
}


// =====================================================
// WORKOUT RECOMMENDATIONS
// =====================================================

function findRecommendedWorkouts() {
    if (!recommendationResults) {
        return;
    }

    const goalElement = document.getElementById("fitnessGoal");
    const levelElement = document.getElementById("fitnessLevel");

    const goal = goalElement
        ? String(goalElement.value || "general").toLowerCase()
        : "general";

    const level = levelElement
        ? String(levelElement.value || "Beginner").toLowerCase()
        : "beginner";

    const matchingWorkouts = (Array.isArray(workouts) ? workouts : [])
        .filter(function (workout) {
            const difficulty = getWorkoutDifficulty(workout).toLowerCase();

            const target = String(workout.target || "").toLowerCase();
            const category = getWorkoutCategory(workout).toLowerCase();

            const difficultyMatches =
                difficulty === level ||
                (
                    level === "beginner" &&
                    difficulty === "beginner"
                );

            let goalMatches = true;

            if (goal !== "general" && goal !== "all") {
                switch (goal) {
                    case "cardio":
                        goalMatches =
                            category.includes("cardio") ||
                            target.includes("cardio") ||
                            target.includes("heart");
                        break;

                    case "strength":
                        goalMatches =
                            category.includes("strength") ||
                            target.includes("muscle") ||
                            target.includes("strength");
                        break;

                    case "upper":
                    case "upper body":
                        goalMatches =
                            target.includes("chest") ||
                            target.includes("arm") ||
                            target.includes("shoulder") ||
                            target.includes("back") ||
                            target.includes("upper");
                        break;

                    case "lower":
                    case "lower body":
                        goalMatches =
                            target.includes("leg") ||
                            target.includes("glute") ||
                            target.includes("calf") ||
                            target.includes("lower");
                        break;

                    case "core":
                        goalMatches =
                            target.includes("core") ||
                            target.includes("ab") ||
                            category.includes("core");
                        break;

                    case "mobility":
                        goalMatches =
                            category.includes("mobility") ||
                            category.includes("flexibility") ||
                            target.includes("mobility");
                        break;

                    default:
                        goalMatches =
                            category.includes(goal) ||
                            target.includes(goal);
                }
            }

            return difficultyMatches && goalMatches;
        });

    if (matchingWorkouts.length === 0) {
        recommendationResults.innerHTML = `
            <div class="recommendation-empty">
                <h3>No exact matches found</h3>
                <p>
                    Try another fitness goal or difficulty level.
                    You can also browse all available exercises.
                </p>

                <button
                    type="button"
                    onclick="displayWorkouts('All')">
                    VIEW ALL WORKOUTS
                </button>
            </div>
        `;

        return;
    }

    recommendationResults.innerHTML = `
        <div class="recommendation-heading">
            <h3>Recommended Exercises</h3>

            <p>
                Based on your selected fitness goal and difficulty.
            </p>
        </div>

        <div class="recommendation-grid">
            ${matchingWorkouts.map(function (workout) {
                const index = workouts.indexOf(workout);

                return `
                    <article class="recommendation-card">

                        <span>
                            ${escapeHtml(getWorkoutDifficulty(workout))}
                        </span>

                        <h4>${escapeHtml(workout.name)}</h4>

                        <p>
                            ${escapeHtml(workout.description || "")}
                        </p>

                        <button
                            type="button"
                            onclick="startWorkoutByIndex(${index})">
                            OPEN EXERCISE
                        </button>

                    </article>
                `;
            }).join("")}
        </div>
    `;
}


// =====================================================
// CREATE OR REPLACE WORKOUT MODAL
// =====================================================

function createWorkoutModal(content) {
    stopAllTimers();

    const existingModal = document.getElementById("workoutModal");

    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement("div");

    modal.id = "workoutModal";
    modal.className = "workout-modal";

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Workout details");

    modal.innerHTML = `
        <div class="workout-modal-box">

            <button
                type="button"
                class="workout-modal-x"
                aria-label="Close workout"
                onclick="closeWorkoutModal()">
                &times;
            </button>

            <div class="workout-modal-content">
                ${content}
            </div>

        </div>
    `;

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeWorkoutModal();
        }
    });

    document.body.appendChild(modal);

    document.body.classList.add("modal-open");

    workoutModalElement = modal;

    requestAnimationFrame(function () {
        modal.classList.add("active");

        const closeButton = modal.querySelector(".workout-modal-x");

        if (closeButton) {
            closeButton.focus();
        }
    });
}


// =====================================================
// OPEN AN INDIVIDUAL WORKOUT
// =====================================================

function startWorkoutByIndex(index) {
    if (!Array.isArray(workouts)) {
        return;
    }

    const workout = workouts[index];

    if (!workout) {
        return;
    }

    startWorkout(workout);
}


function openWorkoutByName(name) {
    const workout = getWorkoutByNameSafe(name);

    if (!workout) {
        alert("The requested exercise could not be found.");
        return;
    }

    startWorkout(workout);
}


function startWorkout(workout) {
    if (!workout) {
        return;
    }

    stopAllTimers();

    activeWorkout = workout;
    activeRoutine = null;

    individualCurrentSet = 1;

    individualTotalSets = Math.max(
        1,
        Number(workout.sets) || 1
    );

    exerciseOriginalSeconds = getExerciseDuration(workout);
    exerciseSeconds = exerciseOriginalSeconds;

    timerOriginalSeconds = getWorkoutRestSeconds(workout);
    timerSeconds = timerOriginalSeconds;

    renderIndividualWorkout();
}


function renderIndividualWorkout() {
    if (!activeWorkout) {
        return;
    }

    const workout = activeWorkout;

    const duration = getExerciseDuration(workout);

    const instructions = workout.instructions
        ? `
            <div class="workout-instructions">
                <h4>Instructions</h4>
                <p>${escapeHtml(workout.instructions)}</p>
            </div>
        `
        : "";

    const benefit = workout.benefit
        ? `
            <div class="workout-benefit">
                <h4>Fitness Benefit</h4>
                <p>${escapeHtml(workout.benefit)}</p>
            </div>
        `
        : "";

    createWorkoutModal(`
        <p class="modal-brand">FRANZ WORKOUT ASSISTANCE</p>

        <span class="workout-difficulty">
            ${escapeHtml(getWorkoutDifficulty(workout))}
        </span>

        <h2>${escapeHtml(workout.name)}</h2>

        <p>
            <strong>Target:</strong>
            ${escapeHtml(workout.target || "General fitness")}
        </p>

        <p>${escapeHtml(workout.description || "")}</p>

        ${instructions}

        ${benefit}

        <div class="modal-details">

            <div>
                <strong>${individualTotalSets}</strong>
                <span>SETS</span>
            </div>

            <div>
                <strong>${escapeHtml(workout.reps || "As instructed")}</strong>
                <span>REPS / TIME</span>
            </div>

            <div>
                <strong>${escapeHtml(workout.rest || "As needed")}</strong>
                <span>REST</span>
            </div>

        </div>

        <div class="timer-box">

            <p>SET PROGRESS</p>

            <h3 id="individualSetProgress">
                Set ${individualCurrentSet} of ${individualTotalSets}
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
            duration > 0
                ? `
                    <div class="timer-box">

                        <p>EXERCISE TIMER</p>

                        <div
                            id="exerciseTimerDisplay"
                            class="timer-display">
                            ${formatTime(duration)}
                        </div>

                        <div
                            id="exerciseTimerStatus"
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

                        <h3>
                            ${escapeHtml(workout.reps || "Follow instructions")}
                        </h3>

                        <p>
                            Complete the prescribed repetitions
                            with controlled movements.
                        </p>

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

                <button
                    type="button"
                    onclick="startTimer()">
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

        <div class="timer-buttons">

            <button
                type="button"
                class="timer-secondary"
                onclick="closeWorkoutModal()">
                CLOSE
            </button>

        </div>
    `);

    updateTimerDisplay();
    updateExerciseTimerDisplay();
}


// =====================================================
// INDIVIDUAL SET TRACKING
// =====================================================

function completeWorkoutSet() {
    if (!activeWorkout) {
        return;
    }

    const progress = document.getElementById("individualSetProgress");

    if (individualCurrentSet < individualTotalSets) {
        individualCurrentSet++;

        if (progress) {
            progress.textContent =
                "Set " +
                individualCurrentSet +
                " of " +
                individualTotalSets;
        }

        playBeep(750, 120);

        return;
    }

    if (progress && progress.dataset.completed === "true") {
        return;
    }

    if (progress) {
        progress.textContent = "All sets completed!";
        progress.dataset.completed = "true";
    }

    playCompletionSound();
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

    if (status) {
        if (exerciseSeconds <= 0) {
            status.textContent = "Exercise time completed!";
        } else if (exerciseTimerIsRunning) {
            status.textContent = "Exercise in progress";
        } else if (exerciseSeconds === exerciseOriginalSeconds) {
            status.textContent = "Ready";
        } else {
            status.textContent = "Paused";
        }
    }
}


function startExerciseTimer() {
    if (exerciseOriginalSeconds <= 0) {
        return;
    }

    if (exerciseSeconds <= 0) {
        exerciseSeconds = exerciseOriginalSeconds;
    }

    if (exerciseTimerIsRunning) {
        return;
    }

    exerciseTimerIsRunning = true;

    updateExerciseTimerDisplay();

    exerciseTimerInterval = setInterval(function () {
        exerciseSeconds--;

        updateExerciseTimerDisplay();

        if (exerciseSeconds <= 0) {
            stopExerciseTimer();

            exerciseSeconds = 0;

            updateExerciseTimerDisplay();

            playCompletionSound();
        }
    }, 1000);
}


function pauseExerciseTimer() {
    stopExerciseTimer();
    updateExerciseTimerDisplay();
}


function resetExerciseTimer() {
    stopExerciseTimer();

    exerciseSeconds = exerciseOriginalSeconds;

    updateExerciseTimerDisplay();
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

    if (status) {
        if (timerSeconds <= 0) {
            status.textContent = "Rest completed!";
        } else if (timerIsRunning) {
            status.textContent = "Rest in progress";
        } else if (timerSeconds === timerOriginalSeconds) {
            status.textContent = "Ready";
        } else {
            status.textContent = "Paused";
        }
    }
}


function startTimer() {
    if (timerOriginalSeconds <= 0) {
        const status = document.getElementById("timerStatus");

        if (status) {
            status.textContent = "No timed rest required.";
        }

        return;
    }

    if (timerSeconds <= 0) {
        timerSeconds = timerOriginalSeconds;
    }

    if (timerIsRunning) {
        return;
    }

    timerIsRunning = true;

    updateTimerDisplay();

    timerInterval = setInterval(function () {
        timerSeconds--;

        updateTimerDisplay();

        if (timerSeconds <= 0) {
            stopRestTimer();

            timerSeconds = 0;

            updateTimerDisplay();

            playCompletionSound();
        }
    }, 1000);
}


function pauseTimer() {
    stopRestTimer();
    updateTimerDisplay();
}


function resetTimer() {
    stopRestTimer();

    timerSeconds = timerOriginalSeconds;

    updateTimerDisplay();
}


// =====================================================
// ROUTINE INTERFACE
// =====================================================

function ensureRoutineInterface() {
    const workoutsSection = document.getElementById("workouts");

    if (!workoutsSection) {
        return;
    }

    if (document.getElementById("routineSection")) {
        renderWorkoutRoutines();
        return;
    }

    const routineSection = document.createElement("section");

    routineSection.id = "routineSection";
    routineSection.className = "routine-section";

    routineSection.innerHTML = `
        <div class="routine-heading">

            <h2>Complete Workout Routines</h2>

            <p>
                Choose a planned sequence of exercises
                and follow each step at your own pace.
            </p>

        </div>

        <div class="routine-filter">

            <label for="routineDifficulty">
                Difficulty
            </label>

            <select id="routineDifficulty">
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
            </select>

            <label for="routineGoal">
                Fitness Goal
            </label>

            <select id="routineGoal">
                <option value="All">All Goals</option>
                <option value="general">General Fitness</option>
                <option value="cardio">Cardio</option>
                <option value="strength">Strength</option>
                <option value="core">Core</option>
            </select>

        </div>

        <div id="routineContainer" class="routine-grid"></div>
    `;

    const workoutResults = document.getElementById("workoutResults");

    if (
        workoutResults &&
        workoutResults.parentElement === workoutsSection
    ) {
        workoutsSection.insertBefore(routineSection, workoutResults);
    } else {
        workoutsSection.appendChild(routineSection);
    }

    document.getElementById("routineDifficulty").addEventListener(
        "change",
        renderWorkoutRoutines
    );

    document.getElementById("routineGoal").addEventListener(
        "change",
        renderWorkoutRoutines
    );

    renderWorkoutRoutines();
}


// =====================================================
// DISPLAY COMPLETE ROUTINES
// =====================================================

function renderWorkoutRoutines() {
    const container = document.getElementById("routineContainer");

    if (!container) {
        return;
    }

    const allRoutines = Array.isArray(workoutRoutines)
        ? workoutRoutines
        : [];

    const difficultyElement = document.getElementById("routineDifficulty");
    const goalElement = document.getElementById("routineGoal");

    const selectedDifficulty = difficultyElement
        ? difficultyElement.value
        : "All";

    const selectedGoal = goalElement
        ? goalElement.value
        : "All";

    const filteredRoutines = allRoutines.filter(function (routine) {
        const difficultyMatches =
            selectedDifficulty === "All" ||
            routine.difficulty === selectedDifficulty;

        const goalMatches =
            selectedGoal === "All" ||
            routine.goal === selectedGoal;

        return difficultyMatches && goalMatches;
    });

    if (filteredRoutines.length === 0) {
        container.innerHTML = `
            <div class="no-workouts-message">
                <h3>No routines available</h3>

                <p>
                    No routine matches these filters yet.
                    Try another difficulty or fitness goal.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = filteredRoutines.map(function (routine) {
        const stepCount = getRoutineSteps(routine).length;

        return `
            <article class="routine-card">

                <span class="routine-difficulty">
                    ${escapeHtml(routine.difficulty || "Beginner")}
                </span>

                <h3>${escapeHtml(routine.name)}</h3>

                <p>${escapeHtml(routine.description || "")}</p>

                <div class="routine-card-details">

                    <span>
                        <strong>Steps:</strong>
                        ${stepCount}
                    </span>

                    <span>
                        <strong>Estimated:</strong>
                        ${escapeHtml(routine.estimatedMinutes || "?")} min
                    </span>

                </div>

                <button
                    type="button"
                    class="start-routine-button"
                    data-routine-id="${escapeHtml(routine.id)}">
                    START COMPLETE ROUTINE
                </button>

            </article>
        `;
    }).join("");

    container.querySelectorAll(".start-routine-button").forEach(
        function (button) {
            button.addEventListener("click", function () {
                const routineId = button.dataset.routineId;

                const routine = typeof getWorkoutRoutineById === "function"
                    ? getWorkoutRoutineById(routineId)
                    : allRoutines.find(function (item) {
                        return item.id === routineId;
                    });

                startWorkoutRoutine(routine);
            });
        }
    );
}


// =====================================================
// GET ROUTINE STEPS
// =====================================================

function getRoutineSteps(routine) {
    if (!routine) {
        return [];
    }

    if (Array.isArray(routine.steps)) {
        return routine.steps;
    }

    if (Array.isArray(routine.exercises)) {
        return routine.exercises;
    }

    return [];
}


// =====================================================
// NORMALIZE ROUTINE STEPS
// =====================================================

function normalizeRoutineStep(step) {
    if (typeof step === "string") {
        return {
            type: "exercise",
            name: step,
            sets: 1,
            reps: "",
            durationSeconds: 0,
            restSeconds: 0
        };
    }

    if (!step || typeof step !== "object") {
        return {
            type: "exercise",
            name: "",
            sets: 1,
            reps: "",
            durationSeconds: 0,
            restSeconds: 0
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
                parseRestSeconds(
                    step.duration ||
                    step.rest ||
                    "30 seconds"
                )
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

        reps: step.reps || "",

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
        .filter(function (step) {
            return step.type === "rest" || step.name;
        });

    if (routineSteps.length === 0) {
        alert("This routine does not contain any exercise steps yet.");
        return;
    }

    stopAllTimers();

    activeRoutine = routine;
    activeWorkout = null;

    routineStepIndex = 0;
    routineCompletedSteps = 0;

    routineCurrentSet = 1;
    routineTotalSets = 1;

    routineIsRunning = false;

    renderRoutineStep();
}


// =====================================================
// RENDER THE CURRENT ROUTINE STEP
// =====================================================

function renderRoutineStep() {
    stopAllTimers();

    if (!activeRoutine) {
        return;
    }

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

    const workout = getWorkoutByNameSafe(step.name);

    if (!workout) {
        console.warn("Routine exercise not found:", step.name);

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
        step.restSeconds > 0
            ? step.restSeconds
            : getWorkoutRestSeconds(workout);

    timerSeconds = timerOriginalSeconds;

    const nextStep = routineSteps[routineStepIndex + 1];

    const displayedReps =
        step.reps ||
        workout.reps ||
        "Follow instructions";

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
            Step ${routineStepIndex + 1}
            of ${routineSteps.length}
        </p>

        <h3>${escapeHtml(workout.name)}</h3>

        <p>
            <strong>Target:</strong>
            ${escapeHtml(workout.target || "General fitness")}
        </p>

        <p>${escapeHtml(workout.description || "")}</p>

        ${
            workout.instructions
                ? `
                    <p>
                        <strong>Instructions:</strong>
                        ${escapeHtml(workout.instructions)}
                    </p>
                `
                : ""
        }

        <div class="modal-details">

            <div>
                <strong>${routineCurrentSet}/${routineTotalSets}</strong>
                <span>SET</span>
            </div>

            <div>
                <strong>${escapeHtml(displayedReps)}</strong>
                <span>REPS / TIME</span>
            </div>

            <div>
                <strong>${escapeHtml(
                    timerOriginalSeconds > 0
                        ? formatTime(timerOriginalSeconds)
                        : "As needed"
                )}</strong>
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

                        <div
                            id="exerciseTimerDisplay"
                            class="timer-display">
                            ${formatTime(duration)}
                        </div>

                        <div
                            id="exerciseTimerStatus"
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

                        <h3>${escapeHtml(displayedReps)}</h3>

                        <p>
                            Complete the prescribed repetitions
                            with controlled movements.
                        </p>

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

                <button
                    type="button"
                    onclick="startTimer()">
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
            Follow your own pace, use proper form,
            and rest whenever needed.
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


// =====================================================
// COMPLETE A ROUTINE SET
// =====================================================

function completeRoutineSet() {
    if (!activeRoutine) {
        return;
    }

    const progress = document.getElementById("routineSetProgress");

    if (
        progress &&
        progress.dataset.completed === "true"
    ) {
        return;
    }

    if (routineCurrentSet < routineTotalSets) {
        routineCurrentSet++;

        if (progress) {
            progress.textContent =
                "Set " +
                routineCurrentSet +
                " of " +
                routineTotalSets;
        }

        playBeep(750, 120);

        return;
    }

    if (progress) {
        progress.textContent = "All sets completed!";
        progress.dataset.completed = "true";
    }

    playCompletionSound();
}


// =====================================================
// ROUTINE RECOVERY STEP
// =====================================================

function renderRoutineRest(step, progressPercent) {
    const duration = Math.max(
        1,
        Number(step.durationSeconds) || 30
    );

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

        <p>
            Take a short break and prepare for your next exercise.
        </p>

        <div class="timer-box">

            <p>REST TIMER</p>

            <div id="timerDisplay" class="timer-display">
                ${formatTime(duration)}
            </div>

            <div id="timerStatus" class="timer-status">
                Ready
            </div>

            <div class="timer-buttons">

                <button
                    type="button"
                    onclick="startTimer()">
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


// =====================================================
// ADVANCE TO THE NEXT ROUTINE STEP
// =====================================================

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


// =====================================================
// ROUTINE COMPLETION
// =====================================================

function showRoutineCompletion() {
    stopAllTimers();

    createWorkoutModal(`
        <p class="modal-brand">FRANZ WORKOUT ASSISTANCE</p>

        <h2>Routine Completed!</h2>

        <div class="modal-line"></div>

        <p>
            You reached the end of
            <strong>
                ${escapeHtml(activeRoutine?.name || "your routine")}
            </strong>.
        </p>

        <p>
            Great job completing your planned workout session.
        </p>

        <p>
            Remember to cool down and drink water as needed.
        </p>

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
// CLOSE THE WORKOUT MODAL
// =====================================================

function closeWorkoutModal() {
    stopAllTimers();

    const modal = document.getElementById("workoutModal");

    if (modal) {
        modal.remove();
    }

    document.body.classList.remove("modal-open");

    activeRoutine = null;
    activeWorkout = null;

    routineSteps = [];
    routineStepIndex = 0;
    routineCompletedSteps = 0;

    routineCurrentSet = 1;
    routineTotalSets = 1;

    individualCurrentSet = 1;
    individualTotalSets = 1;

    routineIsRunning = false;

    workoutModalElement = null;
}


// =====================================================
// ESCAPE KEY SUPPORT
// =====================================================

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeWorkoutModal();
    }
});


// =====================================================
// INITIALIZE THE WEBSITE
// =====================================================

function initializeWorkoutSystem() {
    ensureRoutineInterface();
    displayWorkouts("All");
}

if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        initializeWorkoutSystem
    );
} else {
    initializeWorkoutSystem();
}


// =====================================================
// END OF FRANZ WORKOUT ASSISTANCE SCRIPT
// =====================================================
