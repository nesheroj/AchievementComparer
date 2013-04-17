/// <reference path='Definitions/jquery.d.ts' />
/// <reference path='Definitions/angular.d.ts' />
/// <reference path='Definitions/blizzard.d.ts' />

module AchievementComparer {
    'use strict';

    export interface Category extends BattleNet.AchievementCategory {
        total: number;
        leftContenderProgress: number;
        rightContenderProgress: number;
    }

    export interface IScope extends ng.IScope {
        Math: Math;

        location: ng.ILocationService;
        title: string;
        categories: BattleNet.AchievementCategory[];
        category: Category;
        leftContender: BattleNet.Character;
        rightContender: BattleNet.Character;

        achievementProgress: (contender: BattleNet.Character, achievementId: number) => string;
        criteriaProgress: (contender: BattleNet.Character, criteriaId: number) => string;
        classDesc: (classId: number) => string;
        raceDesc: (raceId: number) => string;
    }

    export interface IStorage {
        getRaces(forceReload?: bool): BattleNet.Races;
        getClasses(forceReload?: bool): BattleNet.Classes;
        getAchievements(forceReload?: bool): BattleNet.Achievements;
        getCharacter(contender: string, forceReload?: bool): BattleNet.Character;
    }

    export class Storage implements IStorage {

        public injection(): any[] {
            return [
                Storage
            ]
        }

        getRaces(forceReload?: bool): BattleNet.Races {
            if (forceReload || localStorage.getItem("races") === null) {
                $.getJSON("http://eu.battle.net/api/wow/data/character/races?jsonp=?").done((json) => {
                    localStorage.setItem("races", JSON.stringify(json));
                    return JSON.parse(localStorage.getItem("races"));
                });
            } else {
                return JSON.parse(localStorage.getItem("races"));
            }
        }

        getClasses(forceReload?: bool): BattleNet.Classes {
            if (forceReload || localStorage.getItem("classes") === null) {
                $.getJSON("http://eu.battle.net/api/wow/data/character/classes?jsonp=?").done((json) => {
                    localStorage.setItem("classes", JSON.stringify(json));
                    return JSON.parse(localStorage.getItem("classes"));
                });
            } else {
                return JSON.parse(localStorage.getItem("classes"));
            }
        }

        getAchievements(forceReload?: bool): BattleNet.Achievements {
            if (forceReload || localStorage.getItem("achievements") === null) {
                $.getJSON("http://eu.battle.net/api/wow/data/character/achievements?jsonp=?").done((json) => {
                    localStorage.setItem("achievements", JSON.stringify(json));
                    return JSON.parse(localStorage.getItem("achievements"));
                });
            } else {
                return JSON.parse(localStorage.getItem("achievements"));
            }
        }

        getCharacter(contender: string, forceReload?: bool): BattleNet.Character {
            if (forceReload || localStorage.getItem(contender) === null) {
                $.getJSON("http://eu.battle.net/api/wow/character/" + contender + "?fields=achievements,guild&jsonp=?").done((json) => {
                    localStorage.setItem(contender, JSON.stringify(json));
                    return JSON.parse(localStorage.getItem(contender));
                });
            } else {
                return JSON.parse(localStorage.getItem(contender));
            }
        }
    }

    export class Controller {
        public injection(): any[] {
            return [
                '$scope',
                '$location',
                'Storage',
                'filterFilter',
                Controller
            ]
        }

        constructor(
           private $scope: IScope,
           private $location: ng.ILocationService,
           private Storage: IStorage,
           private filterFilter
           ) {
            $scope.Math = Math;

            $scope.categories = Storage.getAchievements().achievements;
            $scope.leftContender = Storage.getCharacter("Sanguino/Salka");
            $scope.rightContender = Storage.getCharacter("Sanguino/Cavir");
            $scope.$watch('location.path()', (path) => this.onPath(path));

            $scope.achievementProgress = (contender, achievementId) => this.achievementProgress(contender, achievementId);
            $scope.classDesc = (classId) => { return Storage.getClasses().classes.filter((currentClass) => { return currentClass.id == classId })[0].name };
            $scope.raceDesc = (raceId) => { return Storage.getRaces().races.filter((currentRace) => { return currentRace.id == raceId })[0].name };

            if ($location.path() === '')
                $location.path('/' + $scope.categories[0].name);
            $scope.location = $location;
        }

        onPath(path: string) {
            var categoryPath = path.split("/");
            if (categoryPath.length == 2) {
                var category = this.$scope.categories.filter((category) => { return category.name == categoryPath[1] }).pop();
                var total = 0, leftContenderProgress = 0, rightContenderProgress = 0;
                category.achievements.forEach((achievement) => {
                    total += achievement.points;
                    if (this.$scope.leftContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        leftContenderProgress += achievement.points;
                    if (this.$scope.rightContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        rightContenderProgress += achievement.points;
                });
                this.$scope.title = category.name;
                this.$scope.category = Object.create(category, { total: { value: total }, leftContenderProgress: { value: leftContenderProgress }, rightContenderProgress: { value: rightContenderProgress } });
            } else if (categoryPath.length == 3) {
                var category = this.$scope.categories.filter((currentCategory) => { return currentCategory.name == categoryPath[1] }).pop();
                var subcategory = category.categories.filter((currentSubcategory) => { return currentSubcategory.name == categoryPath[2] }).pop();
                var total = 0, leftContenderProgress = 0, rightContenderProgress = 0;
                subcategory.achievements.forEach((achievement) => {
                    total += achievement.points;
                    if (this.$scope.leftContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        leftContenderProgress += achievement.points;
                    if (this.$scope.rightContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        rightContenderProgress += achievement.points;
                });
                this.$scope.title = category.name + "->" + subcategory.name;
                this.$scope.category = Object.create(subcategory, { total: { value: total }, leftContenderProgress: { value: leftContenderProgress }, rightContenderProgress: { value: rightContenderProgress } });
            }
            $("html, body").animate({ scrollTop: 0 }, "slow");
        }

        achievementProgress = (contender: BattleNet.Character, achievementId: number): string => {
            if (contender.achievements.achievementsCompleted.indexOf(achievementId) == -1)
                return "Incomplete";
            return new Date(contender.achievements.achievementsCompletedTimestamp[contender.achievements.achievementsCompleted.indexOf(achievementId)] * 1000).toDateString();
        };

        criteriaProgress = (contender: BattleNet.Character, criteriaId: number): string => {
            if (contender.achievements.criteria.indexOf(criteriaId) == -1)
                return "0";
            return contender.achievements.criteriaQuantity[contender.achievements.criteria.indexOf(criteriaId)].toString();
        };
    }

    angular.module('AchievementComparer', [])
            .controller('Controller', Controller.prototype.injection())
            .service('Storage', Storage.prototype.injection());
}