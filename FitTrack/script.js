// =====================================================
// FRANZ WORKOUT ASSISTANCE
// MAIN JAVASCRIPT
// =====================================================

const workoutContainer = document.getElementById("workoutContainer");
const resultsTitle = document.getElementById("resultsTitle");
const resultsDescription = document.getElementById("resultsDescription");
const recommendationResults = document.getElementById("recommendationResults");

let timerInterval = null;
let timerSeconds = 0;
let timerOriginalSeconds = 0;
let audioContext = null;


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
            category === "All" ? "All Exercises" : `${category} Exercises`;
    }

    if (resultsDescription) {
        resultsDescription.textContent =
            category === "All"
                ? "Browse all available exercises."
                : `Exercises selected from the ${category.toLowerCase()} category.`;
    }

    if (filteredWorkouts.length === 0) {
        workoutContainer.innerHTML = `
            <div class="no-workouts">
                <h3>No workouts found</h3>
                <p>There are currently no exercises in this category.</p>
            </div>
        `;
        return;
    }

    filteredWorkouts.forEach((workout, index) => {

        const card = document.createElement("div");
        card.className = "workout-card";

        card.innerHTML = `
            <div class="workout-top">
                <span class="category">${escapeHtml(workout.category)}</span>
                <span class="difficulty">${escapeHtml(workout.difficulty)}</span>
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
                data-workout-index="${workouts.indexOf(workout)}">
                START WORKOUT
            </button>
        `;

        const button = card.querySelector(".start-button");

        button.addEventListener("click", () => {
            startWorkoutByIndex(workouts.indexOf(workout));
        });

        workoutContainer.appendChild(card);
    });
}


// =====================================================
// FILTER WORKOUTS
// =====================================================

function filterWorkouts(category) {

    displayWorkouts(category);

    const buttons = document.querySelectorAll(".categories button");

    buttons.forEach(button => {
        button.classList.remove("active");

        if (
            button.textContent.trim().toLowerCase() ===
            category.toLowerCase()
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
// WORKOUT RECOMMENDER
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

    const goal = document.getElementById("fitnessGoal")?.value || "general";
    const level = document.getElementById("fitnessLevel")?.value || "Beginner";

    const preferredCategories = recommendationMap[goal] || ["Cardio", "Legs"];

    let recommended = workouts.filter(workout =>
        preferredCategories.includes(workout.category) &&
        workout.difficulty === level
    );

    // If there are not enough exercises at that level, show suitable
    // exercises from the selected categories instead of showing nothing.
    if (recommended.length < 3) {
        recommended = workouts.filter(workout =>
            preferredCategories.includes(workout.category)
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
            <h3>${escapeHtml(goalNames[goal])} • ${escapeHtml(level)}</h3>
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
                                onclick="openWorkoutByName('${escapeHtml(workout.name).replace(/'/g, "\\'")}')">
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
}

function openWorkoutByName(name) {
    const workout = workouts.find(item => item.name === name);

    if (workout) {
        startWorkout(workout);
    }
}


// =====================================================
// START WORKOUT
// =====================================================

function startWorkoutByIndex(index) {
    const workout = workouts[index];

    if (!workout) {
        return;
    }

    startWorkout(workout);
}

function startWorkout(workout) {

    const existingModal = document.getElementById("workoutModal");

    if (existingModal) {
        existingModal.remove();
    }

    stopTimer();

    const restSeconds = parseRestSeconds(workout.rest);

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

                <p class="modal-brand">FRANZ WORKOUT ASSISTANCE</p>

                <h2>${escapeHtml(workout.name)}</h2>

                <div class="modal-line"></div>

                <div class="modal-target">
                    <strong>TARGET</strong>
                    <p>${escapeHtml(workout.target)}</p>
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

                <div class="modal-description">
                    <strong>EXERCISE DESCRIPTION</strong>
                    <p>${escapeHtml(workout.description)}</p>
                </div>

                <div class="modal-benefit">
                    <strong>FITNESS BENEFIT</strong>
                    <p>${escapeHtml(workout.benefit)}</p>
                </div>

                <p class="form-reminder">
                    Use proper form, work at a comfortable level, and take breaks when needed.
                </p>

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
                            START TIMER
                        </button>

                        <button type="button" class="timer-secondary" onclick="pauseTimer()">
                            PAUSE
                        </button>

                        <button type="button" class="timer-secondary" onclick="resetTimer()">
                            RESET
                        </button>
                    </div>

                </div>

                <button
                    type="button"
                    class="modal-close-bottom"
                    onclick="closeWorkoutModal()">
                    CLOSE WORKOUT
                </button>

            </div>
        </div>
    `;

    document.body.appendChild(modal);

    timerOriginalSeconds = restSeconds;
    timerSeconds = restSeconds;

    document.body.classList.add("modal-open");

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeWorkoutModal();
        }
    });

    updateTimerDisplay();
}


// =====================================================
// TIMER
// =====================================================

function parseRestSeconds(restText) {

    const text = String(restText || "").toLowerCase();

    const minutesMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)/);
    const secondsMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:sec|secs|second|seconds)/);

    let totalSeconds = 0;

    if (minutesMatch) {
        totalSeconds += Number(minutesMatch[1]) * 60;
    }

    if (secondsMatch) {
        totalSeconds += Number(secondsMatch[1]);
    }

    return Math.max(1, Math.round(totalSeconds || 60));
}

function formatTime(seconds) {

    const safeSeconds = Math.max(0, Math.floor(seconds));

    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {

    const display = document.getElementById("timerDisplay");
    const status = document.getElementById("timerStatus");

    if (display) {
        display.textContent = formatTime(timerSeconds);
    }

    if (status && timerSeconds > 0) {
        status.textContent =
            timerInterval ? "Timer running..." : "Ready";
    }
}

function startTimer() {

    if (timerInterval) {
        return;
    }

    if (timerSeconds <= 0) {
        timerSeconds = timerOriginalSeconds;
    }

    // Browser audio normally requires a user interaction first.
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

            const timerBox = document.querySelector(".timer-box");

            if (timerBox) {
                timerBox.classList.add("timer-complete");

                setTimeout(() => {
                    timerBox.classList.remove("timer-complete");
                }, 1800);
            }
        }

    }, 1000);
}

function pauseTimer() {

    if (!timerInterval) {
        return;
    }

    clearInterval(timerInterval);
    timerInterval = null;

    const status = document.getElementById("timerStatus");

    if (status) {
        status.textContent = "Paused";
    }
}

function stopTimer() {

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
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
// TIMER SOUND
// =====================================================

function prepareAudio() {

    try {

        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioContext.state === "suspended") {
            audioContext.resume();
        }

    } catch (error) {
        console.log("Audio is not available in this browser.");
    }
}

function playBeep(frequency = 700, duration = 180, volume = 0.55) {

    try {

        prepareAudio();

        if (!audioContext) {
            return;
        }

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        // A stronger alarm-style tone.
        oscillator.type = "square";
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

        gain.gain.setValueAtTime(
            volume,
            Math.max(startTime + 0.02, endTime - 0.04)
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

    // Loud multi-beep alarm when the rest period finishes.
    // It repeats several tones so the completion is hard to miss.
    const alarm = [
        { frequency: 850, duration: 260, delay: 0 },
        { frequency: 850, duration: 260, delay: 330 },
        { frequency: 1050, duration: 300, delay: 660 },
        { frequency: 1050, duration: 300, delay: 1030 },
        { frequency: 850, duration: 260, delay: 1400 },
        { frequency: 1150, duration: 420, delay: 1730 }
    ];

    alarm.forEach(tone => {
        setTimeout(() => {
            playBeep(tone.frequency, tone.duration, 0.72);
        }, tone.delay);
    });
}


// =====================================================
// CLOSE MODAL
// =====================================================

function closeWorkoutModal() {

    stopTimer();

    const modal = document.getElementById("workoutModal");

    if (modal) {
        modal.remove();
    }

    document.body.classList.remove("modal-open");
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
// INITIAL DISPLAY
// =====================================================

displayWorkouts("All");
