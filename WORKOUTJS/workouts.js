const workouts = [

    // =========================
    // CHEST
    // =========================

    {
        name: "Push-Ups",
        category: "Chest",
        difficulty: "Beginner",
        target: "Chest, Shoulders, Triceps",
        sets: 3,
        reps: "8-15",
        rest: "60 secs",
        description: "A simple bodyweight exercise that helps develop upper-body pushing strength.",
        benefit: "Improves upper-body strength and supports chest and arm development."
    },

    {
        name: "Bench Press",
        category: "Chest",
        difficulty: "Intermediate",
        target: "Chest, Shoulders, Triceps",
        sets: 3,
        reps: "8-12",
        rest: "90 secs",
        description: "A classic resistance exercise using a barbell to train the chest and pushing muscles.",
        benefit: "Builds chest strength and improves pushing power."
    },

    {
        name: "Incline Dumbbell Press",
        category: "Chest",
        difficulty: "Intermediate",
        target: "Upper Chest, Shoulders",
        sets: 3,
        reps: "8-12",
        rest: "90 secs",
        description: "A dumbbell pressing exercise performed on an inclined bench.",
        benefit: "Targets the upper chest while also training the shoulders and triceps."
    },

    {
        name: "Chest Fly",
        category: "Chest",
        difficulty: "Beginner",
        target: "Chest",
        sets: 3,
        reps: "10-15",
        rest: "60 secs",
        description: "An exercise that uses a controlled arm movement to train the chest.",
        benefit: "Helps improve chest strength and muscular control."
    },


    // =========================
    // BACK
    // =========================

    {
        name: "Lat Pulldown",
        category: "Back",
        difficulty: "Beginner",
        target: "Lats, Upper Back, Biceps",
        sets: 3,
        reps: "8-12",
        rest: "90 secs",
        description: "A pulling exercise performed using a cable machine.",
        benefit: "Helps strengthen the back and improve pulling ability."
    },

    {
        name: "Seated Cable Row",
        category: "Back",
        difficulty: "Beginner",
        target: "Middle Back, Lats, Biceps",
        sets: 3,
        reps: "8-12",
        rest: "90 secs",
        description: "A seated pulling movement using a cable machine.",
        benefit: "Strengthens the back and supports good pulling mechanics."
    },

    {
        name: "Dumbbell Row",
        category: "Back",
        difficulty: "Intermediate",
        target: "Lats, Upper Back, Biceps",
        sets: 3,
        reps: "8-12",
        rest: "90 secs",
        description: "A one-arm dumbbell exercise that trains the back through a pulling motion.",
        benefit: "Improves back strength and helps develop pulling muscles."
    },


    // =========================
    // SHOULDERS
    // =========================

    {
        name: "Shoulder Press",
        category: "Shoulders",
        difficulty: "Intermediate",
        target: "Shoulders, Triceps",
        sets: 3,
        reps: "8-12",
        rest: "90 secs",
        description: "A pressing exercise performed with dumbbells or a machine.",
        benefit: "Develops shoulder strength and overhead pressing ability."
    },

    {
        name: "Lateral Raises",
        category: "Shoulders",
        difficulty: "Beginner",
        target: "Side Deltoids",
        sets: 3,
        reps: "10-15",
        rest: "60 secs",
        description: "A controlled movement where the arms are raised outward.",
        benefit: "Targets the side shoulder muscles and supports shoulder strength."
    },


    // =========================
    // ARMS
    // =========================

    {
        name: "Bicep Curls",
        category: "Arms",
        difficulty: "Beginner",
        target: "Biceps",
        sets: 3,
        reps: "10-15",
        rest: "60 secs",
        description: "A basic dumbbell exercise using elbow flexion.",
        benefit: "Strengthens the biceps and improves arm strength."
    },

    {
        name: "Tricep Pushdown",
        category: "Arms",
        difficulty: "Beginner",
        target: "Triceps",
        sets: 3,
        reps: "10-15",
        rest: "60 secs",
        description: "A cable exercise where the arms are extended downward.",
        benefit: "Strengthens the triceps and improves pushing strength."
    },


    // =========================
    // LEGS
    // =========================

    {
        name: "Bodyweight Squats",
        category: "Legs",
        difficulty: "Beginner",
        target: "Quadriceps, Glutes, Hamstrings",
        sets: 3,
        reps: "10-15",
        rest: "60 secs",
        description: "A bodyweight movement that trains the lower body.",
        benefit: "Improves lower-body strength, balance, and movement control."
    },

    {
        name: "Leg Press",
        category: "Legs",
        difficulty: "Intermediate",
        target: "Quadriceps, Glutes, Hamstrings",
        sets: 3,
        reps: "8-12",
        rest: "90 secs",
        description: "A machine-based exercise where the legs push a weighted platform.",
        benefit: "Builds lower-body strength while training several leg muscles."
    },

    {
        name: "Lunges",
        category: "Legs",
        difficulty: "Beginner",
        target: "Quadriceps, Glutes, Hamstrings",
        sets: 3,
        reps: "8-12 each leg",
        rest: "60 secs",
        description: "A single-leg movement that can be performed with bodyweight or weights.",
        benefit: "Improves leg strength, balance, and coordination."
    },


    // =========================
    // CORE
    // =========================

    {
        name: "Plank",
        category: "Core",
        difficulty: "Beginner",
        target: "Abdominals, Core",
        sets: 3,
        reps: "20-45 secs",
        rest: "45 secs",
        description: "An isometric exercise where the body is held in a stable position.",
        benefit: "Improves core stability and body control."
    },

    {
        name: "Crunches",
        category: "Core",
        difficulty: "Beginner",
        target: "Abdominals",
        sets: 3,
        reps: "10-20",
        rest: "45 secs",
        description: "A controlled abdominal exercise using a short trunk movement.",
        benefit: "Strengthens the abdominal muscles."
    },

    {
        name: "Mountain Climbers",
        category: "Core",
        difficulty: "Intermediate",
        target: "Core, Shoulders, Legs",
        sets: 3,
        reps: "20-30 secs",
        rest: "45 secs",
        description: "A dynamic bodyweight exercise combining core stability with alternating leg movement.",
        benefit: "Challenges the core while also increasing physical activity and coordination."
    },


    // =========================
    // CARDIO
    // =========================

    {
        name: "Walking",
        category: "Cardio",
        difficulty: "Beginner",
        target: "Cardiovascular System, Legs",
        sets: 1,
        reps: "20-30 mins",
        rest: "As needed",
        description: "A low-impact activity that can be performed indoors or outdoors.",
        benefit: "Supports cardiovascular fitness and general physical activity."
    },

    {
        name: "Jogging",
        category: "Cardio",
        difficulty: "Intermediate",
        target: "Cardiovascular System, Legs",
        sets: 1,
        reps: "15-30 mins",
        rest: "As needed",
        description: "A moderate-impact cardiovascular activity performed at a steady pace.",
        benefit: "Improves cardiovascular endurance and physical stamina."
    },

    {
        name: "Cycling",
        category: "Cardio",
        difficulty: "Beginner",
        target: "Legs, Cardiovascular System",
        sets: 1,
        reps: "20-40 mins",
        rest: "As needed",
        description: "A cycling activity that can be performed using a bicycle or stationary bike.",
        benefit: "Supports cardiovascular fitness and lower-body endurance."
    }

];