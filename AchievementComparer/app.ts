/// <reference path='Definitions/angular.d.ts' />
/// <reference path='Definitions/blizzard.d.ts' />
/// <reference path='Definitions/jquery.d.ts' />
/// <reference path='utils.ts' />

module AchievementComparer {
    'use strict';

    var ISDEBUG = true;
    var LOG = (message: any, ...optionalParams: any[]) => { if (ISDEBUG) console.log(message, optionalParams) }

    export interface Category extends BattleNet.AchievementCategory {
        total: number;
        leftContenderProgress: number;
        rightContenderProgress: number;
    }

    export interface Region {
        code: string;
        desc: string;
        host: string;
        locales: string[];
    }

    export interface LocaleData {
        locale: string;
        achievements: BattleNet.AchievementCategory[];
        classes: BattleNet.CharacterClass[];
        races: BattleNet.CharacterRace[];
        realms: BattleNet.RealmStatus[];
    }

    export interface IStorage {
        currentRegion: Region;
        currentLocale: string;
        lastLeftContender: string;
        lastRightContender: string;
        localeData: LocaleData;
        cachedCharacters: BattleNet.Character[];
        regions: Region[];

        loadCharacter(contender: string, callback: (character: BattleNet.Character) => void, forceReload?: bool);
    }

    export class Storage implements IStorage {

        currentRegion: Region;
        currentLocale: string;
        lastLeftContender: string;
        lastRightContender: string;
        localeData: LocaleData;
        cachedCharacters: BattleNet.Character[];
        regions: Region[];

        public injection(): any[] {
            return [
                Storage
            ]
        }

        constructor() {
            this.regions = [
                { code: "US", desc: "Americas", host: "http://us.battle.net", locales: ["en_US", "es_MX", "pt_BR"] },
                { code: "EU", desc: "Europe", host: "http://eu.battle.net", locales: ["en_GB", "es_ES", "fr_FR", "ru_RU", "de_DE", "pt_PT", "it_IT"] },
                { code: "KR", desc: "Korea", host: "http://kr.battle.net", locales: ["ko_KR"] },
                { code: "TW", desc: "Taiwan", host: "http://tw.battle.net", locales: ["zh_TW"] },
                { code: "CN", desc: "China", host: "http://www.battlenet.com.cn", locales: ["zh_CN"] }];

            this.currentRegion = this.regions.single((region) => { return region.code == localStorage.getItem("region"); }) || this.regions[0];
            this.setLocale((localStorage.getItem("data") !== null) ? localStorage.getItem("data").locale : this.currentRegion.locales[0]);
            this.lastLeftContender = localStorage.getItem("leftContender");
            this.lastRightContender = localStorage.getItem("rightContender");
            this.cachedCharacters = JSON.parse(localStorage.getItem("characters")) || [];
        }

        setLocale(locale: string): void {
            this.currentLocale = locale;
            this.localeData = JSON.parse(localStorage.getItem("data"));
            if (this.localeData === null || this.localeData.locale != locale) {
                var achievements: BattleNet.AchievementCategory[];
                var classes: BattleNet.CharacterClass[];
                var races: BattleNet.CharacterRace[];
                var realms: BattleNet.RealmStatus[];

                $.getJSON(this.currentRegion.host + "/api/wow/data/character/achievements?locale=" + locale + "&jsonp=?").done((json: BattleNet.Achievements) => {
                    achievements = json.achievements;
                    if ([classes, races, realms].every((current) => { return current != null })) {
                        localStorage.setItem("data", JSON.stringify(this.localeData = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));
                    }
                });

                $.getJSON(this.currentRegion.host + "/api/wow/data/character/classes?locale=" + locale + "&jsonp=?").done((json: BattleNet.Classes) => {
                    classes = json.classes;
                    if ([achievements, races, realms].every((current) => { return current != null })) {
                        localStorage.setItem("data" + locale, JSON.stringify(this.localeData = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));
                    }
                });

                $.getJSON(this.currentRegion.host + "/api/wow/data/character/races?locale=" + locale + "&jsonp=?").done((json: BattleNet.Races) => {
                    races = json.races;
                    if ([achievements, classes, realms].every((current) => { return current != null })) {
                        localStorage.setItem("data", JSON.stringify(this.localeData = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));
                    }
                });

                $.getJSON(this.currentRegion.host + "/api/wow/realm/status?locale=" + locale + "&jsonp=?").done((json: BattleNet.Realms) => {
                    realms = json.realms;
                    if ([achievements, classes, races].every((current) => { return current != null })) {
                        localStorage.setItem("data", JSON.stringify(this.localeData = { locale: locale, achievements: achievements, classes: classes, races: races, realms: realms }));;
                    }
                });

                localStorage.setItem("region", this.currentRegion.code);
                localStorage.setItem("locale", locale)
            }
        }

        loadCharacter(contender: string, callback: (character: BattleNet.Character) => void , forceReload?: bool = false) {
            var character = this.cachedCharacters.single((character) => { return (character.realm + "/" + character.name) !== contender });
            if (forceReload || character === null)
                $.getJSON(this.currentRegion.host + "/api/wow/character/" + contender + "?locale=" + this.currentLocale + "&fields=achievements,guild&jsonp=?").done(callback);
            else callback(character);
        }
    }

    export interface IScope extends ng.IScope {
        Math: Math;

        location: ng.ILocationService;

        region: Region;
        categories: BattleNet.AchievementCategory[];
        recentCharacters: BattleNet.Character[];
        category: Category;
        leftContender: BattleNet.Character;
        leftContenderDummyAvatar: string;
        selectLeftContender: (realm: string, name: string) => void;
        reloadLeftContender: () => void;
        rightContender: BattleNet.Character;
        rightContenderDummyAvatar: string;
        selectRightContender: (realm: string, name: string) => void;
        reloadRightContender: () => void;

        achievementProgress: (contender: BattleNet.Character, achievementId: number) => string;
        criteriaProgress: (contender: BattleNet.Character, criteriaId: number) => string;
        classDesc: (classId: number) => string;
        raceDesc: (raceId: number) => string;
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

            $scope.leftContenderDummyAvatar = Math.floor((Math.random() * 11) + 1) + "-" + Math.floor((Math.random() * 2));
            if (Storage.lastLeftContender !== null) {
                Storage.loadCharacter(Storage.lastLeftContender, (character) => {
                    $scope.leftContender = character;
                    $scope.location = $location;
                });
            }
            $scope.rightContenderDummyAvatar = Math.floor((Math.random() * 11) + 1) + "-" + Math.floor((Math.random() * 2));
            if (Storage.lastRightContender !== null) {
                Storage.loadCharacter(Storage.lastRightContender, (character) => {
                    $scope.rightContender = character;
                    $scope.location = $location;
                });
            }

            $scope.$watch((scope) => { return Storage.currentRegion; }, () => { $scope.region = Storage.currentRegion; });

            $scope.$watch((scope) => { return Storage.cachedCharacters; }, () => { $scope.recentCharacters = Storage.cachedCharacters; });

            $scope.$watch((scope) => { return Storage.localeData; }, () => { if (Storage.localeData) $scope.categories = Storage.localeData.achievements; });

            $scope.$watch('location.path()', (path) => this.onPath(path));

            $scope.reloadLeftContender = () => {
                Storage.loadCharacter($scope.leftContender.realm + "/" + $scope.leftContender.name, (character) => {
                    $scope.leftContender = character;
                    $scope.location = $location;
                }, true);
            };

            $scope.selectLeftContender = (realm: string, name: string) => {
                if (name === '') {
                    $scope.leftContenderDummyAvatar = Math.floor((Math.random() * 11) + 1) + "-" + Math.floor((Math.random() * 2));
                    $scope.leftContender = null;
                } else {
                    Storage.loadCharacter(realm + "/" + name, (character) => {
                        $scope.leftContender = character;
                        $scope.location = $location;
                    });
                }
            };

            $scope.reloadRightContender = () => {
                Storage.loadCharacter($scope.rightContender.realm + "/" + $scope.rightContender.name, (character) => {
                    $scope.rightContender = character;
                    $scope.location = $location;
                }, true);
            };

            $scope.selectRightContender = (realm: string, name: string) => {
                if (name === '') {
                    $scope.rightContenderDummyAvatar = Math.floor((Math.random() * 11) + 1) + "-" + Math.floor((Math.random() * 2));
                    $scope.rightContender = null;
                } else {
                    Storage.loadCharacter(realm + "/" + name, (character) => {
                        $scope.rightContender = character;
                        $scope.location = $location;
                    });
                }
            };

            $scope.achievementProgress = (contender: BattleNet.Character, achievementId: number): string => {
                if (contender.achievements.achievementsCompleted.indexOf(achievementId) == -1)
                    return "Incomplete";
                return new Date(contender.achievements.achievementsCompletedTimestamp[contender.achievements.achievementsCompleted.indexOf(achievementId)] * 1000).toDateString();
            };

            $scope.criteriaProgress = (contender: BattleNet.Character, criteriaId: number): string => {
                if (contender.achievements.criteria.indexOf(criteriaId) == -1)
                    return "0";
                return contender.achievements.criteriaQuantity[contender.achievements.criteria.indexOf(criteriaId)].toString();
            };

            $scope.classDesc = (classId) => {
                return (classId === undefined) ? "" : Storage.localeData.classes.single((currentClass) => { return currentClass.id == classId }).name
            };
            $scope.raceDesc = (raceId) => {
                return (raceId === undefined) ? "" : Storage.localeData.races.single((currentRace) => { return currentRace.id == raceId }).name
            };

            $scope.location = $location;
        }

        onPath(path: string) {
            if (!(this.$scope.leftContender && this.$scope.leftContender)) return;
            if (path === "") path = "/" + this.$scope.categories[0].name;
            var categoryPath = path.split("/");
            if (categoryPath.length == 2) {
                var category = this.$scope.categories.single((category) => { return category.name == categoryPath[1] });
                var total = 0, leftContenderProgress = 0, rightContenderProgress = 0;
                category.achievements.forEach((achievement) => {
                    total += achievement.points;
                    if (this.$scope.leftContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        leftContenderProgress += achievement.points;
                    if (this.$scope.rightContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        rightContenderProgress += achievement.points;
                });
                this.$scope.category = Object.create(category, { total: { value: total }, leftContenderProgress: { value: leftContenderProgress }, rightContenderProgress: { value: rightContenderProgress } });
            } else if (categoryPath.length == 3) {
                var category = this.$scope.categories.single((currentCategory) => { return currentCategory.name == categoryPath[1] });
                var subcategory = category.categories.single((currentSubcategory) => { return currentSubcategory.name == categoryPath[2] });
                var total = 0, leftContenderProgress = 0, rightContenderProgress = 0;
                subcategory.achievements.forEach((achievement) => {
                    total += achievement.points;
                    if (this.$scope.leftContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        leftContenderProgress += achievement.points;
                    if (this.$scope.rightContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0)
                        rightContenderProgress += achievement.points;
                });
                this.$scope.category = Object.create(subcategory, { total: { value: total }, leftContenderProgress: { value: leftContenderProgress }, rightContenderProgress: { value: rightContenderProgress } });
            }
            $("html, body").animate({ scrollTop: 0 }, "slow");
        }
    }

    $(() => {
        var link: HTMLLinkElement = <HTMLLinkElement>document.createElement('link');
        link.type = 'image/gif';
        link.rel = 'shortcut icon';
        link.href = 'data:image/gif;base64,R0lGODlhCAAKALMKAOKwIkw3D2VMEkAtDVlCEKN9GicZCnJWE8mcH9WmIP///wAAAAAAAAAAAAAAAAAAACH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4wLWMwNjAgNjEuMTM0Nzc3LCAyMDEwLzAyLzEyLTE3OjMyOjAwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NUE4RDcyNTVGRjRBMTFERjgwQjY4MDk4RUZFRkQzMTQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NUE4RDcyNTZGRjRBMTFERjgwQjY4MDk4RUZFRkQzMTQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1QThENzI1M0ZGNEExMURGODBCNjgwOThFRkVGRDMxNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1QThENzI1NEZGNEExMURGODBCNjgwOThFRkVGRDMxNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAEAAAoALAAAAAAIAAoAAAQcEJ2gVDgI6M27/1zhFYM3KAInVAqRJARbGQYbAQA7';
        document.getElementsByTagName('head')[0].appendChild(link);
    });

    angular.module('AchievementComparer', [])
            .controller('Controller', Controller.prototype.injection())
            .service('Storage', Storage.prototype.injection());
}