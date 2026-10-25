const packs = {
    "ohms-law": {
        id: "ohms-law",
        version: 1,
        title: "Verify Ohm's law",
        sizeLabel: "Under 1 MB",
        skills: [
            "Connecting meters",
            "Recording readings",
            "Plotting a graph",
            "Finding a gradient",
        ],
        resources: ["/", "/simulate/ohms-law"],
    },
};

export function getSimulationPack(req, res) {
    const pack = packs[req.params.slug];
    if (!pack) {
        return res.status(404).json({ message: "Simulation pack not found." });
    }

    return res.json({ pack });
}
