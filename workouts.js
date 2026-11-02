// =====================================================
// FRANZ WORKOUT ASSISTANCE
// EXERCISE DATABASE AND WORKOUT ROUTINES
// =====================================================

// Each exercise contains:
// name, category, difficulty, target, sets, reps, rest,
// description, benefit, instructions, exerciseType,
// durationSeconds, and restSeconds.
//
// exerciseType:
// "reps" = exercise measured by repetitions
// "timed" = exercise measured by time

const workouts = [

    // =================================================
    // CHEST
    // =================================================

    {
        name: "Push-Ups",
        category: "Chest",
        difficulty: "Beginner",
        target: "Chest, shoulders, triceps, core",
        sets: 2,
        reps: "5-10 reps",
        rest: "60 seconds",
        restSeconds: 60,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A bodyweight exercise that trains the chest, shoulders, and triceps.",
        benefit: "Develops upper-body strength and core stability.",
        instructions: "Place your hands slightly wider than shoulder-width. Keep your body aligned, lower yourself under control, and push back up. Use a wall or elevated surface if the standard version is too difficult."
    },

    {
        name: "Bench Press",
        category: "Chest",
        difficulty: "Intermediate",
        target: "Chest, shoulders, triceps",
        sets: 3,
        reps: "8-12 reps",
        rest: "90 seconds",
        restSeconds: 90,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A resistance exercise performed using a bench and barbell.",
        benefit: "Builds upper-body pushing strength.",
        instructions: "Use a manageable weight, keep your feet stable, and lower the bar under control. Use a spotter when appropriate. Do not attempt heavy lifts without proper supervision."
    },

    {
        name: "Incline Dumbbell Press",
        category: "Chest",
        difficulty: "Intermediate",
        target: "Upper chest, shoulders, triceps",
        sets: 3,
        reps: "8-12 reps",
        rest: "90 seconds",
        restSeconds: 90,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A dumbbell pressing exercise performed on an inclined bench.",
        benefit: "Develops upper-body pushing strength.",
        instructions: "Set the bench to a comfortable incline. Hold the dumbbells securely, lower them with control, and press upward without locking your elbows forcefully."
    },

    {
        name: "Chest Fly",
        category: "Chest",
        difficulty: "Beginner",
        target: "Chest",
        sets: 2,
        reps: "10-12 reps",
        rest: "60 seconds",
        restSeconds: 60,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A chest isolation exercise performed with dumbbells or a suitable machine.",
        benefit: "Helps develop chest-muscle control and strength.",
        instructions: "Use light resistance. Keep a slight bend in your elbows and move slowly. Avoid lowering your arms beyond a comfortable range."
    },


    // =================================================
    // BACK
    // =================================================

    {
        name: "Lat Pulldown",
        category: "Back",
        difficulty: "Beginner",
        target: "Latissimus dorsi, upper back, biceps",
        sets: 2,
        reps: "8-12 reps",
        rest: "60 seconds",
        restSeconds: 60,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A machine exercise that pulls a bar toward the upper chest.",
        benefit: "Develops back strength and pulling control.",
        instructions: "Sit securely, hold the bar comfortably wide, and pull toward your upper chest. Avoid swinging your torso or pulling the bar behind your neck."
    },

    {
        name: "Seated Cable Row",
        category: "Back",
        difficulty: "Beginner",
        target: "Middle back, lats, biceps",
        sets: 2,
        reps: "8-12 reps",
        rest: "60 seconds",
        restSeconds: 60,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A seated pulling exercise using a cable machine.",
        benefit: "Supports back strength and controlled posture.",
        instructions: "Sit upright, pull the handle toward your torso, and bring it forward slowly. Avoid excessive leaning or jerking."
    },

    {
        name: "Dumbbell Row",
        category: "Back",
        difficulty: "Intermediate",
        target: "Back, lats, biceps",
        sets: 2,
        reps: "8-12 reps per side",
        rest: "60-90 seconds",
        restSeconds: 75,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A one-arm pulling exercise performed with a dumbbell.",
        benefit: "Builds pulling strength and helps train each side independently.",
        instructions: "Support yourself on a stable bench or surface. Keep your back controlled and pull the dumbbell toward your hip without twisting your torso."
    },


    // =================================================
    // SHOULDERS
    // =================================================

    {
        name: "Shoulder Press",
        category: "Shoulders",
        difficulty: "Intermediate",
        target: "Shoulders, triceps",
        sets: 2,
        reps: "8-12 reps",
        rest: "90 seconds",
        restSeconds: 90,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "An overhead pressing exercise using dumbbells or a suitable machine.",
        benefit: "Develops shoulder and upper-body pushing strength.",
        instructions: "Use a manageable weight. Keep your torso stable and press upward within a comfortable range. Stop if you experience shoulder pain."
    },

    {
        name: "Lateral Raises",
        category: "Shoulders",
        difficulty: "Beginner",
        target: "Shoulders",
        sets: 2,
        reps: "10-12 reps",
        rest: "60 seconds",
        restSeconds: 60,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A shoulder exercise using light dumbbells.",
        benefit: "Helps develop shoulder strength and movement control.",
        instructions: "Hold light dumbbells at your sides. Raise your arms outward with a slight bend in your elbows, then lower them slowly."
    },


    // =================================================
    // ARMS
    // =================================================

    {
        name: "Bicep Curls",
        category: "Arms",
        difficulty: "Beginner",
        target: "Biceps",
        sets: 2,
        reps: "8-12 reps",
        rest: "60 seconds",
        restSeconds: 60,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "An arm exercise performed with dumbbells or resistance equipment.",
        benefit: "Develops elbow-flexor strength.",
        instructions: "Keep your elbows close to your sides. Curl the weight upward without swinging your body, then lower it slowly."
    },

    {
        name: "Tricep Pushdown",
        category: "Arms",
        difficulty: "Beginner",
        target: "Triceps",
        sets: 2,
        reps: "8-12 reps",
        rest: "60 seconds",
        restSeconds: 60,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A triceps exercise using a cable machine.",
        benefit: "Develops the muscles used to straighten the elbow.",
        instructions: "Keep your elbows near your sides and push the handle downward under control. Return slowly without letting the weight pull your shoulders forward."
    },


    // =================================================
    // LEGS
    // =================================================

    {
        name: "Bodyweight Squats",
        category: "Legs",
        difficulty: "Beginner",
        target: "Quadriceps, glutes, hamstrings",
        sets: 2,
        reps: "8-12 reps",
        rest: "60 seconds",
        restSeconds: 60,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A bodyweight movement that trains the lower body.",
        benefit: "Develops leg strength, coordination, and functional movement.",
        instructions: "Stand with your feet about shoulder-width apart. Bend your hips and knees, lower only as far as comfortable, then stand up. Keep your feet stable."
    },

    {
        name: "Leg Press",
        category: "Legs",
        difficulty: "Intermediate",
        target: "Quadriceps, glutes, hamstrings",
        sets: 2,
        reps: "8-12 reps",
        rest: "90 seconds",
        restSeconds: 90,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A lower-body resistance exercise using a leg press machine.",
        benefit: "Builds lower-body pushing strength.",
        instructions: "Adjust the machine correctly and use a manageable load. Lower the platform under control and avoid forcefully locking your knees."
    },

    {
        name: "Lunges",
        category: "Legs",
        difficulty: "Beginner",
        target: "Quadriceps, glutes, hamstrings",
        sets: 2,
        reps: "6-10 reps per leg",
        rest: "60-90 seconds",
        restSeconds: 75,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A single-leg movement that trains lower-body strength and balance.",
        benefit: "Supports leg strength, balance, and coordination.",
        instructions: "Take a comfortable step forward and bend both knees within a comfortable range. Push back to the starting position. Hold a stable support if needed."
    },


    // =================================================
    // CORE
    // =================================================

    {
        name: "Plank",
        category: "Core",
        difficulty: "Beginner",
        target: "Abdominals, core, shoulders",
        sets: 2,
        reps: "15-30 seconds",
        rest: "45 seconds",
        restSeconds: 45,
        exerciseType: "timed",
        durationSeconds: 20,
        description: "A static bodyweight exercise that trains the core.",
        benefit: "Develops core endurance and body control.",
        instructions: "Support yourself on your forearms and toes, or use your knees for an easier variation. Keep your body aligned and breathe normally. Stop when you can no longer maintain good form."
    },

    {
        name: "Crunches",
        category: "Core",
        difficulty: "Beginner",
        target: "Abdominal muscles",
        sets: 2,
        reps: "8-12 reps",
        rest: "45 seconds",
        restSeconds: 45,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A short-range abdominal exercise performed on the floor.",
        benefit: "Trains abdominal strength and control.",
        instructions: "Lie on your back with your knees bent. Gently lift your shoulders using your abdominal muscles, then lower slowly. Avoid pulling on your neck."
    },

    {
        name: "Mountain Climbers",
        category: "Core",
        difficulty: "Intermediate",
        target: "Core, shoulders, hip flexors",
        sets: 2,
        reps: "20 seconds",
        rest: "45-60 seconds",
        restSeconds: 60,
        exerciseType: "timed",
        durationSeconds: 20,
        description: "A dynamic bodyweight movement performed from a high plank position.",
        benefit: "Challenges core stability and cardiovascular endurance.",
        instructions: "Start in a stable high plank. Bring one knee toward your chest, return it, and alternate sides. Move slowly at first and keep your hips controlled."
    },


    // =================================================
    // CARDIO
    // =================================================

    {
        name: "Walking",
        category: "Cardio",
        difficulty: "Beginner",
        target: "Cardiovascular system, legs",
        sets: 1,
        reps: "2-10 minutes",
        rest: "As needed",
        restSeconds: 0,
        exerciseType: "timed",
        durationSeconds: 120,
        description: "A low-impact activity that can be performed indoors or outdoors.",
        benefit: "Supports cardiovascular fitness and everyday mobility.",
        instructions: "Walk at a comfortable pace on a safe, suitable route. Begin with a manageable duration and adjust according to your ability."
    },

    {
        name: "Jogging",
        category: "Cardio",
        difficulty: "Intermediate",
        target: "Cardiovascular system, legs",
        sets: 1,
        reps: "1-5 minutes",
        rest: "As needed",
        restSeconds: 0,
        exerciseType: "timed",
        durationSeconds: 60,
        description: "A running activity that challenges cardiovascular endurance.",
        benefit: "Can improve aerobic fitness and lower-body endurance.",
        instructions: "Begin at an easy pace on a safe route. Alternate jogging with walking if needed. Increase duration gradually instead of pushing through pain or unusual symptoms."
    },

    {
        name: "Cycling",
        category: "Cardio",
        difficulty: "Beginner",
        target: "Cardiovascular system, legs",
        sets: 1,
        reps: "5-15 minutes",
        rest: "As needed",
        restSeconds: 0,
        exerciseType: "timed",
        durationSeconds: 300,
        description: "A cardiovascular activity using a bicycle or stationary bike.",
        benefit: "Supports cardiovascular fitness and lower-body endurance.",
        instructions: "Adjust the seat and resistance appropriately. Begin at a comfortable pace and use suitable safety equipment when cycling outdoors."
    },


    // =================================================
    // ADDITIONAL BEGINNER EXERCISES
    // =================================================

    {
        name: "Wall Push-Ups",
        category: "Chest",
        difficulty: "Beginner",
        target: "Chest, shoulders, triceps",
        sets: 2,
        reps: "8-12 reps",
        rest: "45-60 seconds",
        restSeconds: 60,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A beginner-friendly push-up variation performed against a wall.",
        benefit: "Introduces upper-body pushing movement with reduced loading.",
        instructions: "Place your hands on a wall at chest height. Bend your elbows to bring your chest toward the wall, then push away. Keep your body aligned."
    },

    {
        name: "Marching in Place",
        category: "Cardio",
        difficulty: "Beginner",
        target: "Legs, cardiovascular system",
        sets: 1,
        reps: "1-3 minutes",
        rest: "As needed",
        restSeconds: 0,
        exerciseType: "timed",
        durationSeconds: 60,
        description: "A simple cardio activity performed by marching on the spot.",
        benefit: "Provides a convenient way to begin moving and warm up.",
        instructions: "Stand in a stable position and alternate lifting your feet. Move at a comfortable pace and hold a stable support if needed."
    },

    {
        name: "Standing Calf Raises",
        category: "Legs",
        difficulty: "Beginner",
        target: "Calves",
        sets: 2,
        reps: "10-12 reps",
        rest: "45-60 seconds",
        restSeconds: 60,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A standing exercise that raises the heels off the floor.",
        benefit: "Strengthens the calf muscles and supports ankle movement.",
        instructions: "Stand near a stable support. Raise your heels slowly, pause briefly, and lower under control. Use a comfortable range of motion."
    },

    {
        name: "Glute Bridges",
        category: "Legs",
        difficulty: "Beginner",
        target: "Glutes, hamstrings, core",
        sets: 2,
        reps: "8-12 reps",
        rest: "45-60 seconds",
        restSeconds: 60,
        exerciseType: "reps",
        durationSeconds: 0,
        description: "A floor exercise performed while lying on your back with knees bent.",
        benefit: "Develops hip-extension strength and glute activation.",
        instructions: "Lie on your back with knees bent and feet flat. Lift your hips comfortably, pause briefly, and lower slowly without overextending your lower back."
    }

];


// =====================================================
// COMPLETE WORKOUT ROUTINES
// =====================================================
//
// Routine steps refer to exercise names in the workouts
// array. Timed steps can override the normal exercise
// duration for the selected routine.
//
// The routine player will be connected in a later step.

const workoutRoutines = [

    {
        id: "beginner-cardio",
        name: "Beginner Cardio",
        difficulty: "Beginner",
        goal: "cardio",
        estimatedMinutes: 6,
        description: "A short introductory routine that alternates walking and recovery.",
        steps: [
            {
                type: "exercise",
                exerciseName: "Walking",
                durationSeconds: 120
            },
            {
                type: "rest",
                name: "Recovery",
                durationSeconds: 30
            },
            {
                type: "exercise",
                exerciseName: "Marching in Place",
                durationSeconds: 60
            },
            {
                type: "rest",
                name: "Recovery",
                durationSeconds: 30
            },
            {
                type: "exercise",
                exerciseName: "Walking",
                durationSeconds: 120
            }
        ]
    },

    {
        id: "beginner-full-body",
        name: "Beginner Full Body",
        difficulty: "Beginner",
        goal: "general",
        estimatedMinutes: 8,
        description: "A simple introduction to upper-body, lower-body, and core movements.",
        steps: [
            {
                type: "exercise",
                exerciseName: "Wall Push-Ups",
                sets: 2,
                reps: "8-10 reps",
                restSeconds: 45
            },
            {
                type: "exercise",
                exerciseName: "Bodyweight Squats",
                sets: 2,
                reps: "8-10 reps",
                restSeconds: 45
            },
            {
                type: "exercise",
                exerciseName: "Glute Bridges",
                sets: 2,
                reps: "8-10 reps",
                restSeconds: 45
            },
            {
                type: "exercise",
                exerciseName: "Plank",
                sets: 2,
                durationSeconds: 15,
                restSeconds: 45
            }
        ]
    },

    {
        id: "beginner-strength",
        name: "Beginner Strength",
        difficulty: "Beginner",
        goal: "strength",
        estimatedMinutes: 8,
        description: "A short routine introducing controlled bodyweight strength exercises.",
        steps: [
            {
                type: "exercise",
                exerciseName: "Bodyweight Squats",
                sets: 2,
                reps: "8-10 reps",
                restSeconds: 60
            },
            {
                type: "exercise",
                exerciseName: "Wall Push-Ups",
                sets: 2,
                reps: "8-10 reps",
                restSeconds: 60
            },
            {
                type: "exercise",
                exerciseName: "Standing Calf Raises",
                sets: 2,
                reps: "10-12 reps",
                restSeconds: 45
            }
        ]
    },

    {
        id: "intermediate-cardio",
        name: "Intermediate Cardio Intervals",
        difficulty: "Intermediate",
        goal: "cardio",
        estimatedMinutes: 8,
        description: "An interval routine that alternates short jogging periods with walking recovery.",
        steps: [
            {
                type: "exercise",
                exerciseName: "Walking",
                durationSeconds: 120
            },
            {
                type: "exercise",
                exerciseName: "Jogging",
                durationSeconds: 60
            },
            {
                type: "exercise",
                exerciseName: "Walking",
                durationSeconds: 120
            },
            {
                type: "exercise",
                exerciseName: "Jogging",
                durationSeconds: 60
            },
            {
                type: "exercise",
                exerciseName: "Walking",
                durationSeconds: 120
            }
        ]
    },

    {
        id: "core-basics",
        name: "Core Basics",
        difficulty: "Beginner",
        goal: "core",
        estimatedMinutes: 5,
        description: "A short core routine with controlled movements and recovery.",
        steps: [
            {
                type: "exercise",
                exerciseName: "Crunches",
                sets: 2,
                reps: "8-10 reps",
                restSeconds: 45
            },
            {
                type: "exercise",
                exerciseName: "Plank",
                sets: 2,
                durationSeconds: 15,
                restSeconds: 45
            }
        ]
    }

];


// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Find an exercise by its name.
function getWorkoutByName(name) {
    return workouts.find(function (workout) {
        return workout.name.toLowerCase() === name.toLowerCase();
    });
}

// Find a complete routine by its ID.
function getWorkoutRoutineById(id) {
    return workoutRoutines.find(function (routine) {
        return routine.id === id;
    });
}

// Return routines that match a difficulty level.
function getWorkoutRoutinesByDifficulty(difficulty) {
    return workoutRoutines.filter(function (routine) {
        return routine.difficulty === difficulty;
    });
}

// Return routines that match a fitness goal.
function getWorkoutRoutinesByGoal(goal) {
    if (!goal || goal === "general") {
        return workoutRoutines;
    }

    return workoutRoutines.filter(function (routine) {
        return routine.goal === goal;
    });
}
