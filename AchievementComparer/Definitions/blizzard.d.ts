declare module BattleNet {
    // Blizz's data structures
    interface Character {
        lastModified: number;
        name: string;
        realm: string;
        battlegroup: string;
        class: number;
        race: number;
        gender: number;
        level: number;
        achievementPoints: number;
        thumbnail: string;
        calcClass: string;
        achievements?: CharacterAchievements;
        guild?: CharacterGuild;
    }

    interface CharacterAchievements {
        achievementsCompleted: number[];
        achievementsCompletedTimestamp: number[];
        criteria: number[];
        criteriaQuantity: number[];
        criteriaTimestamp: number[];
        criteriaCreated: number[];
    }

    interface AchievementCategory {
        id: number;
        achievements: Achievement[];
        categories?: AchievementCategory[];
        name: string;
    }

    interface Achievements {
        achievements: AchievementCategory[];
    }

    interface Achievement {
        id: number;
        accountWide: boolean;
        criteria: AchievementCriteria[];
        description: string;
        factionId: number;
        icon: string;
        points: number;
        rewardItems: Object[];
        title: string;
    }

    interface AchievementCriteria {
        description: String;
        id: number;
        max: number;
        orderIndex: number;
    }

    interface CharacterGuild {
        achievementPoints: number;
        battlegroup: string;
        emblem: GuildEmblem;
        level: number;
        members: number;
        name: string;
        realm: string;
    }

    interface GuildEmblem {
        backgroundColor: string;
        border: number;
        borderColor: string;
        icon: number;
        iconColor: string;
    }

    interface Classes {
        classes: CharacterClass[];
    }

    interface CharacterClass {
        id: number;
        mask: number;
        powerType: string;
        name: string;
    }

    interface Races {
        races: CharacterRace[];
    }

    interface CharacterRace {
        id: number;
        mask: number;
        side: string;
        name: string;
    }

    interface Realms {
        realms: RealmStatus[];
    }

    interface RealmStatus {
        battlegroup: string;
        locale: string;
        name: string;
        population: string;
        queue: boolean;
        slug: string;
        status: boolean;
        timezone: string;
        //"tol-barad": TolBaradInfo;
        type: string;
        //wintergrasp: WintergraspInfo;
    }
}