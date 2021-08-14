"use strict";

/**
 * @type {Record<string, {
 *     requiredBy: string[] | undefined
 *     eventSprite: boolean // Whether to use the event spritesheet
 *     icon: string
 *     posX: number
 *     posY: number
 *     width: number
 *     height: number
 *     level: number
 *     prerequisites: string[]
 *     getCost(level: number): number
 *     getEffect(level: number): string
 *     getUnlocked(): string // tells you if miscellaneous requirements have been met. if they have, returns nothing. if they have not, returns a message stating why not.
 *     clicked(): void
 *     apply(time: string): void
 * }>
 */
// idea: aspect which helps to reveal more of the tree
SharkGame.Aspects = {
    apotheosis: {
        posX: 380,
        posY: 550,
        width: 40,
        height: 40,

        max: 4,
        level: 0,
        name: "Apotheosis",
        description: "The path begins here.",
        getCost(level) {
            return (level + 1) ** 2;
        },
        getEffect(level) {
            return "Manual resource collection x" + (level > 0 ? level * 4 : 1) + ".";
        },
        getUnlocked() {},
        prerequisites: [],
        clicked(_event) {
            tree.increaseLevel(this);
        },
    },
    pathOfIndustry: {
        posX: 690,
        posY: 350,
        width: 40,
        height: 40,

        max: 3,
        level: 0,
        name: "Path of Industry",
        description: "Unlock the potential of those around you.",
        getCost(level) {
            switch (level) {
                case 0:
                    return 1;
                case 1:
                    return 20;
                case 2:
                    return 48;
            }
        },
        getEffect(level) {
            switch (level) {
                case 1:
                    return "Unlock a moveable token that doubles production of whatever it is placed on.";
                case 2:
                    return "Unlock a second token (tokens cannot stack on the same resource).";
                case 3:
                    return "Unlock a third token (tokens cannot stack on the same resource).";
            }
        },
        getUnlocked() {},
        prerequisites: ["apotheosis"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
    },
    pathOfEnlightenment: {
        posX: 380,
        posY: 350,
        width: 40,
        height: 40,

        max: 1,
        level: 0,
        name: "Path of Enlightenment",
        description: "Unlock the potential of yourself.",
        getCost(_level) {
            return 2;
        },
        getEffect(level) {
            switch (level) {
                case 1:
                    return "Reveals basic information about a world before you choose to visit it.";
                //case 2:
                //    return "Reveals basic information about a world before you choose to visit it, and identifies unknown resources.";
            }
        },
        getUnlocked() {},
        prerequisites: ["apotheosis"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
    },
    patience: {
        posX: 300,
        posY: 250,
        width: 40,
        height: 40,

        get max() {
            if (SharkGame.persistentFlags.patience) {
                return this.level;
            } else {
                return this.level + 1;
            }
        },
        level: 0,
        name: "Patience",
        description: "They say that good things come to those who wait.",
        getCost(level) {
            return (level + 2) ** 2;
        },
        getEffect(level) {
            if (SharkGame.persistentFlags.patience) {
                return (
                    "Gain nothing now. After beating " +
                    SharkGame.persistentFlags.patience +
                    " more world" +
                    (SharkGame.persistentFlags.patience > 1 ? "s" : "") +
                    ", gain " +
                    2 * (level + 1) ** 2 +
                    " essence."
                );
            }
            return "Gain nothing now. After beating 3 more worlds, gain " + 2 * (level + 1) ** 2 + " essence.";
        },
        getUnlocked() {},
        prerequisites: ["pathOfEnlightenment"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
        apply(when) {
            if (when === "levelUp") {
                SharkGame.persistentFlags.patience = 3;
            }
        },
    },
    pathOfTime: {
        posX: 70,
        posY: 350,
        width: 40,
        height: 40,

        max: 5,
        level: 0,
        name: "Path of Time",
        description: "Patience is the choice of those who prefer inaction.",
        getCost(level) {
            return (level + 1) ** 2 + 1;
        },
        getEffect(level) {
            const base = 20 * main.getProgressionConstant("2-scale");
            return "Start with " + base * level ** 2 + " crabs. If they do not exist, start with an equivalent.";
        },
        getUnlocked() {},
        prerequisites: ["apotheosis"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
        apply(when) {
            if (when === "init" && res.getResource("crab") === 0 && !SharkGame.flags.pathOfTimeApplied) {
                const base = 20 * main.getProgressionConstant("2-scale") * this.level ** 2;
                switch (world.worldType) {
                    case "shrouded":
                        res.changeResource("diver", base * 0.5);
                        break;
                    default:
                        res.changeResource("crab", base);
                }
                SharkGame.flags.pathOfTimeApplied = true;
            }
        },
    },
    coordinatedCooperation: {
        posX: 610,
        posY: 250,
        width: 40,
        height: 40,

        max: 4,
        level: 0,
        name: "Coordinated Cooperation",
        description: "Maybe the squid had a point. Maybe teamwork really is the key.",
        getCost(level) {
            return 16 * (level + 1);
        },
        getEffect(level) {
            return "Tokens increase production by " + (level + 2) + "x.";
        },
        getUnlocked() {
            return gateway.completedWorlds.includes("frigid") ? "" : "Complete the Frigid worldtype to unlock this aspect.";
        },
        prerequisites: ["pathOfIndustry"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
    },
    /*
    clawSharpening: {
        posX: 690,
        posY: 150,
        width: 40,
        height: 40,

        max: 4,
        level: 0,
        name: "Claw Sharpening",
        get description() {
            return "Perhaps " + sharktext.getResourceName("crab", false, 69) + " could collect fish if they were better equipped for hunting.";
        },
        getCost(level) {
            return level + 2;
        },
        getEffect(level) {
            return (
                sharktext.getResourceName("crab", false, 69) +
                " hunt " +
                sharktext.getResourceName("fish", false, 69) +
                " at " +
                0.1 * 2 ** (level - 1) +
                "/s."
            );
        },
        getUnlocked() {},
        prerequisites: ["adjustedAquadynamics"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
        apply(when) {
            if (when === "init") {
                res.applyModifier("clawSharpening", "crab", this.level);
            }
        },
    },
    crustaceanAptitude: {
        posX: 690,
        posY: 50,
        width: 40,
        height: 40,

        max: 4,
        level: 0,
        name: "Crustacean Aptitude",
        get description() {
            return sharktext.getResourceName("crab", false, 69) + " are flexible. They'll do whatever we need them to.";
        },
        getCost(level) {
            return 2 * level + 5;
        },
        getEffect(level) {
            return (
                sharktext.getResourceName("crab", false, 69) + " and their professions collect world-specific resources " + (level + 1) + "x faster."
            );
        },
        getUnlocked() {},
        prerequisites: ["clawSharpening"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
        apply(when) {
            if (when === "init") {
                res.applyModifier("crustaceanAptitude", "crab", this.level);
                res.applyModifier("crustaceanAptitude", "collector", this.level);
            }
        },
    },
    constructedConception: {
        posX: 530,
        posY: 150,
        width: 40,
        height: 40,

        max: 4,
        level: 0,
        name: "Constructed Conception",
        get description() {
            return (
                "Making new " +
                sharktext.getResourceName("shark", false, 69) +
                " and " +
                sharktext.getResourceName("ray", false, 69) +
                " could be more efficient. It doesn't hurt to use a little essence to help out."
            );
        },
        getCost(level) {
            return 2 * level + 4;
        },
        getEffect(level) {
            return (
                sharktext.getResourceName("nurse", false, 69) +
                " and " +
                sharktext.getResourceName("maker", false, 69) +
                " are " +
                (level + 1) +
                "x faster."
            );
        },
        getUnlocked() {
            return gateway.completedWorlds.includes("haven") ? "" : "Complete the Haven worldtype to unlock this aspect.";
        },
        prerequisites: ["adjustedAquadynamics"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
        apply(when) {
            if (when === "init") {
                res.applyModifier("constructedConception", "nurse", this.level);
                res.applyModifier("constructedConception", "maker", this.level);
            }
        },
    }, */
    syntheticTransmutation: {
        posX: 770,
        posY: 250,
        width: 40,
        height: 40,

        max: 3,
        level: 0,
        name: "Synthetic Transmutation",
        description: "Sharkonium is naturally unaffected by small impurities. Perhaps we can cheat a little.",
        getCost(level) {
            return 2 * level + 4;
        },
        getEffect(level) {
            return "Sharkonium is " + 20 * level + "% cheaper to produce.";
        },
        getUnlocked() {},
        prerequisites: ["pathOfIndustry"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
    },
    amorphousAssembly: {
        posX: 770,
        posY: 150,
        width: 40,
        height: 40,

        max: 1,
        level: 0,
        name: "Amorphous Assembly",
        description: "Machines that make use of similar components are better machines.",
        getCost(_level) {
            return 7;
        },
        getEffect(_level) {
            return (
                sharktext.getResourceName("crystalMiner", false, 2) +
                " and " +
                sharktext.getResourceName("sandDigger") +
                " have non-" +
                sharktext.getResourceName("sharkonium") +
                " costs reduced by half."
            );
        },
        getUnlocked() {},
        prerequisites: ["syntheticTransmutation"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
    },
    destinyGamble: {
        posX: 460,
        posY: 250,
        width: 40,
        height: 40,

        max: 5,
        level: 0,
        name: "Destiny Gamble",
        description: "Where we end up is all luck, but sometimes, we can stack the deck.",
        getCost(level) {
            return 2 + level;
        },
        getEffect(level) {
            return "Between worlds, have the opportunity to reroll your world selection up to " + level + " time" + (level > 0 ? "s" : "") + ".";
        },
        getUnlocked() {},
        prerequisites: ["pathOfEnlightenment"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
        apply(when) {
            if (when === "levelUp") {
                if (_.isUndefined(SharkGame.persistentFlags.destinyRolls)) {
                    SharkGame.persistentFlags.destinyRolls = this.level;
                } else {
                    SharkGame.persistentFlags.destinyRolls += 1;
                }
            }
        },
    },
    crystallineSkin: {
        posX: 0,
        posY: 250,
        width: 40,
        height: 40,

        max: 3,
        level: 0,
        name: "Crystalline Skin",
        description: "Become one with the lattice.",
        getCost(level) {
            return 2 * level + 4;
        },
        getEffect(level) {
            const base = 20 * main.getProgressionConstant("2-scale");
            return "Start with " + base * level ** 2 + " crystals. If they do not exist, start with an equivalent.";
        },
        getUnlocked() {},
        prerequisites: ["pathOfTime"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
        apply(when) {
            if (when === "init" && res.getResource("crystal") === 0 && !SharkGame.flags.crystallineSkinApplied) {
                const base = 20 * main.getProgressionConstant("2-scale") * this.level ** 2;
                res.changeResource("crystal", base);
                SharkGame.flags.crystallineSkinApplied = true;
            }
        },
    },
    /*     keenEyesight: {
        posX: 0,
        posY: 50,
        width: 40,
        height: 40,

        max: 10,
        level: 0,
        name: "Keen Eyesight",
        description: "Learn to stop overlooking the small stuff.",
        getCost(level) {
            return 3 * level + 5;
        },
        getEffect(level) {
            return (
                "Unlocks a button to manually gather " +
                sharktext.getResourceName("crystal", false, 420) +
                ". " +
                0.01 * level * SharkGame.Aspects.apotheosis.level +
                " " +
                sharktext.getResourceName("crystal", false, 420) +
                " per click."
            );
        },
        getUnlocked() {
            //return SharkGame.Gateway.completedWorlds.includes("shrouded") ? "" : "Complete the Shrouded worldtype to unlock this aspect.";
            return "This aspect will be implemented in a future update.";
        },
        prerequisites: ["crystallineSkin"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
    }, */
    theMinuteHand: {
        posX: 0,
        posY: 150,
        width: 40,
        height: 40,

        max: 5,
        level: 0,
        name: "The Minute Hand",
        description: "Time is relative.",
        getCost(level) {
            switch (level) {
                case 0:
                    return 4;
                default:
                    return 3 + level;
            }
        },
        getEffect(level) {
            let speedConstant;
            switch (SharkGame.Settings.current.gameSpeed) {
                case "Idle":
                    speedConstant = 5;
                    break;
                case "Inactive":
                    speedConstant = 3;
                    break;
                default:
                    speedConstant = 1;
                    break;
            }
            return "Unlock a rechargeable " + (speedConstant + level) + "x speed boost.";
        },
        getUnlocked() {},
        prerequisites: ["crystallineSkin"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
    },
    theSecondHand: {
        posX: -80,
        posY: 50,
        width: 40,
        height: 40,

        max: 5,
        level: 0,
        name: "The Second Hand",
        description: "Reality is a construct of the mind.",
        getCost(level) {
            return 6 * (level + 1);
        },
        getEffect(level) {
            return "The Minute Hand recharges " + (level + 1) + "x faster.";
        },
        getUnlocked() {},
        prerequisites: ["theMinuteHand"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
    },
    theHourHand: {
        posX: 80,
        posY: 50,
        width: 40,
        height: 40,

        max: 5,
        level: 0,
        name: "The Hour Hand",
        description: "Perception is an illusion.",
        getCost(level) {
            return 4 + level;
        },
        getEffect(level) {
            return "The Minute Hand starts with " + sharktext.boldString(60 + 30 * level + "s") + " when entering a new world.";
        },
        getUnlocked() {},
        prerequisites: ["theMinuteHand"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
    },
    internalCalculator: {
        posX: 140,
        posY: 250,
        width: 40,
        height: 40,

        max: 2,
        level: 0,
        name: "Internal Calculator",
        description: "The octopuses could always manifest the rational from the confusing. Master their efficiency inside your own mind.",
        getCost(_level) {
            return 4;
        },
        getEffect(level) {
            if (level === 1) {
                return "If a research costs " + 150 * main.getProgressionConstant() + " science or less, then its science cost is halved.";
            } else {
                return "If a research costs " + 150 * main.getProgressionConstant() + " science or less, then all its costs are halved.";
            }
        },
        getUnlocked() {
            return gateway.completedWorlds.includes("abandoned") ? "" : "Complete the Abandoned worldtype to unlock this aspect.";
        },
        prerequisites: ["pathOfTime"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
    },
    extensiveOrganization: {
        posX: 140,
        posY: 150,
        width: 40,
        height: 40,

        max: 2,
        level: 0,
        name: "Extensive Organization",
        description: "Be prepared. Organize. No wasted time.",
        getCost(_level) {
            return 2;
        },
        getEffect(level) {
            if (level === 1) {
                return "Start with the grotto already unlocked.";
            } else {
                return "Start with the grotto and the laboratory already unlocked.";
            }
        },
        getUnlocked() {
            //return SharkGame.Gateway.completedWorlds.includes("tempestuous") ? "" : "Complete the Tempestuous worldtype to unlock this aspect.";
        },
        prerequisites: ["internalCalculator"],
        clicked(_event) {
            tree.increaseLevel(this);
        },
        apply(when) {
            if (when === "init") {
                SharkGame.Lab.addUpgrade("statsDiscovery");
                if (this.level > 1) {
                    SharkGame.TabHandler.discoverTab("lab");
                }
            }
        },
    },
    // remember to add upgrade which adds manual crystal button, locked behind shrouded worldtype

    //name: "The Plan",
    //description: "Professionals have standards. Be polite, be efficient, and have a plan to recruit everyone you meet.",
    //
};
