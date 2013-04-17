var AchievementComparer;
(function (AchievementComparer) {
    'use strict';
    var Storage = (function () {
        function Storage() { }
        Storage.prototype.injection = function () {
            return [
                Storage
            ];
        };
        Storage.prototype.getRaces = function (forceReload) {
            if(forceReload || localStorage.getItem("races") === null) {
                $.getJSON("http://eu.battle.net/api/wow/data/character/races?jsonp=?").done(function (json) {
                    localStorage.setItem("races", JSON.stringify(json));
                    return JSON.parse(localStorage.getItem("races"));
                });
            } else {
                return JSON.parse(localStorage.getItem("races"));
            }
        };
        Storage.prototype.getClasses = function (forceReload) {
            if(forceReload || localStorage.getItem("classes") === null) {
                $.getJSON("http://eu.battle.net/api/wow/data/character/classes?jsonp=?").done(function (json) {
                    localStorage.setItem("classes", JSON.stringify(json));
                    return JSON.parse(localStorage.getItem("classes"));
                });
            } else {
                return JSON.parse(localStorage.getItem("classes"));
            }
        };
        Storage.prototype.getAchievements = function (forceReload) {
            if(forceReload || localStorage.getItem("achievements") === null) {
                $.getJSON("http://eu.battle.net/api/wow/data/character/achievements?jsonp=?").done(function (json) {
                    localStorage.setItem("achievements", JSON.stringify(json));
                    return JSON.parse(localStorage.getItem("achievements"));
                });
            } else {
                return JSON.parse(localStorage.getItem("achievements"));
            }
        };
        Storage.prototype.getCharacter = function (contender, forceReload) {
            if(forceReload || localStorage.getItem(contender) === null) {
                $.getJSON("http://eu.battle.net/api/wow/character/" + contender + "?fields=achievements&jsonp=?").done(function (json) {
                    localStorage.setItem(contender, JSON.stringify(json));
                    return JSON.parse(localStorage.getItem(contender));
                });
            } else {
                return JSON.parse(localStorage.getItem(contender));
            }
        };
        return Storage;
    })();
    AchievementComparer.Storage = Storage;    
    var Controller = (function () {
        function Controller($scope, $location, Storage, filterFilter) {
            this.$scope = $scope;
            this.$location = $location;
            this.Storage = Storage;
            this.filterFilter = filterFilter;
            var _this = this;
            this.achievementProgress = function (contender, achievementId) {
                if(contender.achievements.achievementsCompleted.indexOf(achievementId) == -1) {
                    return "Incomplete";
                }
                return new Date(contender.achievements.achievementsCompletedTimestamp[contender.achievements.achievementsCompleted.indexOf(achievementId)] * 1000).toDateString();
            };
            this.criteriaProgress = function (contender, criteriaId) {
                if(contender.achievements.criteria.indexOf(criteriaId) == -1) {
                    return "0";
                }
                return contender.achievements.criteriaQuantity[contender.achievements.criteria.indexOf(criteriaId)].toString();
            };
            $scope.categories = Storage.getAchievements().achievements;
            $scope.leftContender = Storage.getCharacter("Sanguino/Salka");
            $scope.rightContender = Storage.getCharacter("Sanguino/Cavir");
            $scope.$watch('location.path()', function (path) {
                return _this.onPath(path);
            });
            $scope.achievementProgress = function (contender, achievementId) {
                return _this.achievementProgress(contender, achievementId);
            };
            $scope.classDesc = function (classId) {
                return Storage.getClasses().classes.filter(function (currentClass) {
                    return currentClass.id == classId;
                })[0].name;
            };
            $scope.raceDesc = function (raceId) {
                return Storage.getRaces().races.filter(function (currentRace) {
                    return currentRace.id == raceId;
                })[0].name;
            };
            if($location.path() === '') {
                $location.path('/' + $scope.categories[0].name);
            }
            $scope.location = $location;
        }
        Controller.prototype.injection = function () {
            return [
                '$scope', 
                '$location', 
                'Storage', 
                'filterFilter', 
                Controller
            ];
        };
        Controller.prototype.onPath = function (path) {
            var _this = this;
            var categoryPath = path.split("/");
            if(categoryPath.length == 2) {
                var category = this.$scope.categories.filter(function (category) {
                    return category.name == categoryPath[1];
                }).pop();
                var total = 0, leftContenderProgress = 0, rightContenderProgress = 0;
                category.achievements.forEach(function (achievement) {
                    total += achievement.points;
                    if(_this.$scope.leftContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0) {
                        leftContenderProgress += achievement.points;
                    }
                    if(_this.$scope.rightContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0) {
                        rightContenderProgress += achievement.points;
                    }
                });
                this.$scope.title = category.name;
                this.$scope.category = Object.create(category, {
                    total: {
                        value: total
                    },
                    leftContenderProgress: {
                        value: leftContenderProgress
                    },
                    rightContenderProgress: {
                        value: rightContenderProgress
                    }
                });
            } else if(categoryPath.length == 3) {
                var category = this.$scope.categories.filter(function (currentCategory) {
                    return currentCategory.name == categoryPath[1];
                }).pop();
                var subcategory = category.categories.filter(function (currentSubcategory) {
                    return currentSubcategory.name == categoryPath[2];
                }).pop();
                var total = 0, leftContenderProgress = 0, rightContenderProgress = 0;
                subcategory.achievements.forEach(function (achievement) {
                    total += achievement.points;
                    if(_this.$scope.leftContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0) {
                        leftContenderProgress += achievement.points;
                    }
                    if(_this.$scope.rightContender.achievements.achievementsCompleted.indexOf(achievement.id) >= 0) {
                        rightContenderProgress += achievement.points;
                    }
                });
                this.$scope.title = category.name + "->" + subcategory.name;
                this.$scope.category = Object.create(subcategory, {
                    total: {
                        value: total
                    },
                    leftContenderProgress: {
                        value: leftContenderProgress
                    },
                    rightContenderProgress: {
                        value: rightContenderProgress
                    }
                });
            }
        };
        return Controller;
    })();
    AchievementComparer.Controller = Controller;    
    angular.module('AchievementComparer', []).controller('Controller', Controller.prototype.injection()).service('Storage', Storage.prototype.injection());
})(AchievementComparer || (AchievementComparer = {}));
