// breakSuggestions.ts

export interface BreakActivity {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    howTo: string[];
    imageUrl: string;
}

export const stretchSuggestions: BreakActivity[] = [
    {
        id: 'neck-stretch',
        title: "Neck & Shoulder Release",
        subtitle: "Active Rest",
        description: "Gently tilt your head toward each shoulder for 15 seconds each.",
        howTo: [
            "Sit upright with your shoulders relaxed.",
            "Gently drop your right ear toward your right shoulder.",
            "Hold for 15-30 seconds, breathing deeply.",
            "Slowly return to center and repeat on the left side.",
            "Don't pull or force your head; let gravity do the work."
        ],
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnE4hR14_ShOxaQSZ6mdiVRJd1GlYZpzPJMaFh1LqSTtVtQ9vn5wdz8SLmNJqiX87BvGZnmswgAY2Lf6Ge3EHcFPxKHcaa8LcDKvjCHGqWfvS3yKaXUPxo1RoaZUl6ZY8PsjFvVO34bb2ApKrgTS_v5OGpfOOwf3rLO-zMnXaW84Rvz8TdPbOAcP875Nh4BuWqqvusXiPXIf5OT1rZzioRAVgT-fHVfbh04jMynY-Hg-dzzFWZcRMXygY7a3RbZAd1rO-10JaogGI"
    },
    {
        id: 'eye-rest',
        title: "20-20-20 Rule",
        subtitle: "Visual Care",
        description: "Every 20 minutes, look at something 20 feet away for 20 seconds.",
        howTo: [
            "Look away from your screen.",
            "Find an object about 20 feet (6 meters) away.",
            "Focus on it for at least 20 seconds.",
            "Blink several times to moisten your eyes.",
            "This helps reduce digital eye strain."
        ],
        imageUrl: "https://images.unsplash.com/photo-1516733968453-30b013b25828?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
        id: 'wrist-stretch',
        title: "Wrist & Hand Stretch",
        subtitle: "Ergonomics",
        description: "Stretch your wrists and fingers to prevent repetitive strain.",
        howTo: [
            "Extend one arm in front of you, palm facing up.",
            "Use your other hand to gently pull your fingers back toward your body.",
            "Hold for 15 seconds.",
            "Flip your hand over (palm facing down) and gently push it down.",
            "Repeat with the other hand."
        ],
        imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
        id: 'spinal-twist',
        title: "Seated Spinal Twist",
        subtitle: "Back Health",
        description: "Relieve tension in your lower back with a gentle seated twist.",
        howTo: [
            "Sit on the edge of your chair with feet flat on the floor.",
            "Place your right hand on the back of the chair and your left hand on your right knee.",
            "Inhale to grow tall, then exhale to gently twist to the right.",
            "Hold for 15-20 seconds, then repeat on the other side.",
            "Ensure you're twisting from your spine, not just moving your neck."
        ],
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400&h=400"
    },
    {
        id: 'deep-breathing',
        title: "Box Breathing",
        subtitle: "Mental Clarity",
        description: "A simple technique to reset your nervous system and reduce stress.",
        howTo: [
            "Inhale slowly through your nose for 4 seconds.",
            "Hold your breath for 4 seconds.",
            "Exhale slowly through your mouth for 4 seconds.",
            "Hold your breath for 4 seconds before the next inhale.",
            "Repeat the cycle 3-4 times."
        ],
        imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400&h=400"
    }
];

export const getRandomSuggestion = () => {
    return stretchSuggestions[Math.floor(Math.random() * stretchSuggestions.length)];
};
