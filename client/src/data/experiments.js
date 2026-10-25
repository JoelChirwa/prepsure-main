
export const experiments = [
    {
        id: "acid-base-indicators",
        title: "Testing Acids and Bases with Indicators",
        category: "Acids and Bases",
        difficulty: "Beginner",
        duration: "20 minutes",
        summary:
            "Use indicators to investigate acidic, neutral, and alkaline solutions.",
        theory:
            "Acids produce hydrogen ions in aqueous solution, while alkalis produce hydroxide ions. Indicators are substances whose colours depend on the acidity or alkalinity of a solution. Universal indicator shows a range of colours across the pH scale; litmus provides a simpler acid/alkali distinction. Observations should be compared with the supplied indicator chart rather than guessed.",
        apparatusImages: [],
        objectives: [
            "Use an indicator to test different solutions.",
            "Classify solutions as acidic, neutral, or alkaline.",
            "Record colour changes accurately.",
        ],
        apparatus: [
            "Test tubes",
            "Test-tube rack",
            "Droppers",
            "Universal indicator or litmus paper",
            "Small samples of labelled solutions",
        ],
        procedure: [
            "Label a clean test tube for each solution.",
            "Place a small sample of each solution into its labelled test tube.",
            "Add the indicator according to your teacher's instructions, or test with indicator paper.",
            "Record the colour observed for each sample.",
            "Use the indicator colour chart to classify each solution.",
        ],
        observations: [
            {
                test: "Universal indicator",
                result: "Compare the observed colour with the indicator chart.",
            },
            {
                test: "Red and blue litmus",
                result: "Record whether either paper changes colour.",
            },
        ],
        conclusion:
            "Indicators help distinguish acidic, neutral, and alkaline solutions. The classification should be based on the observed indicator response.",
        safety: [
            "Wear safety goggles and follow your teacher's instructions.",
            "Never taste laboratory chemicals.",
            "Avoid skin and eye contact with unknown solutions.",
            "Dispose of samples as directed by your teacher.",
        ],
    },
    {
        id: "filtration",
        title: "Separating an Insoluble Solid by Filtration",
        category: "Separation Techniques",
        difficulty: "Beginner",
        duration: "25 minutes",
        summary:
            "Separate an insoluble solid from a liquid using filter paper and a funnel.",
        theory:
            "Filtration separates an insoluble solid from a liquid using a porous barrier. The liquid and dissolved substances pass through the pores as the filtrate, while particles too large to pass through remain as the residue. Filtration does not separate a dissolved substance from its solvent.",
        apparatusImages: [],
        objectives: [
            "Assemble a simple filtration apparatus.",
            "Distinguish the residue from the filtrate.",
            "Explain when filtration is appropriate.",
        ],
        apparatus: [
            "Filter funnel",
            "Filter paper",
            "Beaker",
            "Conical flask",
            "Glass rod",
            "A teacher-approved mixture of sand and water",
        ],
        procedure: [
            "Fold the filter paper and fit it into the funnel.",
            "Place the funnel over a clean receiving flask or beaker.",
            "Wet the filter paper slightly so that it sits against the funnel.",
            "Pour the mixture slowly along a glass rod into the filter paper.",
            "Observe the solid left on the paper and the liquid collected below.",
        ],
        observations: [
            {
                test: "Filter paper",
                result: "Record the appearance of the solid residue.",
            },
            {
                test: "Collected liquid",
                result: "Record whether the filtrate appears clear or contains visible particles.",
            },
        ],
        conclusion:
            "Filtration separates an insoluble solid from a liquid. The solid retained on the filter paper is the residue, and the liquid that passes through is the filtrate.",
        safety: [
            "Handle glassware carefully.",
            "Clean up spills promptly.",
            "Do not pour mixtures containing unknown chemicals down the drain.",
        ],
    },
    {
        id: "oxygen-test",
        title: "Testing for Oxygen Gas",
        category: "Gas Tests",
        difficulty: "Intermediate",
        duration: "15 minutes",
        summary:
            "Learn the standard laboratory test used to identify oxygen gas.",
        theory:
            "Oxygen supports combustion but is not itself a fuel. A glowing splint provides a practical test: in a suitable oxygen sample it relights. This observation is evidence used to infer the presence of oxygen. The test should use a prepared sample and be carried out only with teacher supervision.",
        apparatusImages: [],
        objectives: [
            "Describe the test for oxygen.",
            "Identify the expected positive observation.",
            "Distinguish an observation from an inference.",
        ],
        apparatus: [
            "Prepared oxygen sample",
            "Test tube or suitable gas-collection vessel",
            "Wooden splint",
            "Suitable ignition source under teacher supervision",
            "Safety goggles",
        ],
        procedure: [
            "Obtain a prepared oxygen sample using your teacher's approved method.",
            "Light a wooden splint and then extinguish the flame so that the splint is glowing.",
            "Carefully introduce the glowing splint into the oxygen sample, following teacher instructions.",
            "Observe and record what happens to the glowing splint.",
        ],
        observations: [
            {
                test: "Glowing splint",
                result: "Record whether the splint relights.",
            },
        ],
        conclusion:
            "Oxygen supports combustion. A glowing splint that relights is the standard positive test for oxygen.",
        safety: [
            "Perform this test only under direct teacher supervision.",
            "Keep combustible materials away from the test area.",
            "Use only a small, teacher-prepared gas sample.",
            "Keep the gas vessel pointed away from people.",
        ],
    },
    {
        id: "acid-carbonate",
        title: "Reaction Between an Acid and a Carbonate",
        category: "Acids and Bases",
        difficulty: "Intermediate",
        duration: "20 minutes",
        summary:
            "Observe the reaction of an acid with a carbonate and investigate the gas produced.",
        theory:
            "An acid reacting with a carbonate produces a salt, water, and carbon dioxide. The visible bubbles are evidence that a gas is being released. When a teacher directs the standard carbon dioxide test, the gas turns limewater milky because an insoluble carbonate forms.",
        apparatusImages: [],
        objectives: [
            "Record observations during a chemical reaction.",
            "Identify the gas commonly produced by an acid-carbonate reaction.",
            "Relate observations to the products of the reaction.",
        ],
        apparatus: [
            "Teacher-approved dilute acid",
            "Small quantity of a suitable carbonate",
            "Test tube or flask",
            "Delivery tube and suitable collection apparatus if directed",
            "Limewater for a teacher-supervised gas test",
        ],
        procedure: [
            "Wear suitable eye protection and use only the quantities directed by your teacher.",
            "Place the approved carbonate sample in the reaction vessel.",
            "Add the dilute acid as instructed.",
            "Observe the reaction and record any bubbling or other changes.",
            "If directed, test the gas produced using the approved carbon dioxide test.",
        ],
        observations: [
            {
                test: "Reaction mixture",
                result: "Record whether effervescence occurs and whether the solid changes.",
            },
            {
                test: "Carbon dioxide test",
                result: "If tested, record whether limewater turns milky.",
            },
        ],
        conclusion:
            "Acids react with carbonates to form a salt, water, and carbon dioxide. Effervescence indicates gas production; the gas test provides further evidence.",
        safety: [
            "Use only dilute, teacher-approved acid.",
            "Wear eye protection and avoid contact with chemicals.",
            "Do not seal the reaction vessel unless a teacher directs a suitable procedure.",
            "Follow your laboratory's disposal instructions.",
        ],
    },
    {
        id: "titration",
        title: "Introduction to Acid–Base Titration",
        category: "Titration",
        difficulty: "Advanced",
        duration: "35 minutes",
        summary:
            "Explore how measured volumes of solutions and an indicator can help determine a neutralisation point.",
        theory:
            "Acid-base titration uses measured volumes of solutions to find the point at which an acid and an alkali have reacted in the required proportions. An indicator changes colour over a particular pH range and helps identify the endpoint. Accurate readings, careful dropwise addition near the endpoint, and repeat measurements improve reliability.",
        apparatusImages: [],
        objectives: [
            "Identify the main parts of a titration setup.",
            "Read a burette scale carefully.",
            "Record initial and final volumes and calculate the titre.",
        ],
        apparatus: [
            "Burette and stand",
            "Pipette and pipette filler",
            "Conical flask",
            "Suitable indicator",
            "Teacher-approved acid and alkali solutions",
            "Safety goggles",
        ],
        procedure: [
            "Set up and check the burette according to your teacher's instructions.",
            "Measure the required sample into a conical flask using the correct pipette technique.",
            "Add the prescribed indicator.",
            "Add the solution from the burette while swirling the flask.",
            "Near the endpoint, add the titrant dropwise until the specified indicator change is observed.",
            "Record the initial and final burette readings and calculate the titre.",
        ],
        observations: [
            {
                test: "Indicator",
                result: "Record the colour before titration and the endpoint colour.",
            },
            {
                test: "Burette readings",
                result: "Record initial and final readings, then calculate the titre.",
            },
        ],
        conclusion:
            "Titration uses measured solution volumes and an indicator endpoint to investigate neutralisation. Reliable results depend on careful technique and accurate readings.",
        safety: [
            "Carry out titration under teacher supervision.",
            "Wear goggles and use a pipette filler rather than mouth pipetting.",
            "Handle burettes and pipettes carefully.",
            "Use only the specified solutions and concentrations.",
        ],
    },
];

export const categories = [
    "All categories",
    ...new Set(experiments.map((experiment) => experiment.category)),
];

export const difficulties = [
    "All levels",
    "Beginner",
    "Intermediate",
    "Advanced",
];
