/*global angular*/
(function(angular) {
    'use strict';
    var crickMeBoardApp = angular.module('crickMeBoardApp', []);
    crickMeBoardApp.controller('crickMeBoardController', ['$scope', '$http', '$templateCache', '$timeout','$window', function ($scope, $http, $templateCache, $timeout, $window) {
        var teamAScore,
            teamAWickets,
            teamAPlayedOvers,
            maxExtraBallsSelection = 0,
            selectedIds = [],
            AlertMessage1 = "Enter Max Overs",
            AlertMessage2 = "Enter Team A, Team B Names",
            AlertMessage3 = "Choose Batting Side",
            winningTeam,
            resetAfterInnings = function () {
                $scope.firstInningsDetails = angular.copy($scope.totalOversDetails);
                $scope.totalOversDetails = [];
                teamAScore = angular.copy($scope.currentTeamScore);
                $scope.currentTeamScore = 0;
                teamAWickets = angular.copy($scope.totalWickets);
                $scope.totalWickets = 0;
                teamAPlayedOvers = angular.copy($scope.currentTeamPlayedOvers);
                $scope.currentTeamPlayedOvers = 0;
                $scope.currentOverScore = 0;
            },
            matchSummary = function () {
                if (teamAScore > $scope.currentTeamScore) {
                    $scope.resultsContent1 = $scope.battingSideTitle.toUpperCase() + "  WON";
                    $scope.resultsContent2 = "";
                    winningTeam = "** " + $scope.battingSideTitle.toUpperCase() + " WON ** ";
                }
                else if (teamAScore < $scope.currentTeamScore) {
                    $scope.resultsContent1 = $scope.bowlingSideTitle.toUpperCase() + "  WON";
                    $scope.resultsContent2 = "";
                    winningTeam = "** " + $scope.bowlingSideTitle.toUpperCase() + " WON ** ";
                } else {
                    $scope.resultsContent1 = "MATCH  DRAW";
                    $scope.resultsContent2 = "";
                    winningTeam = "MATCH DRAW";
                }
                    $scope.resultsHeader = "MATCH OVER";
                    $scope.openResultsModal();
            },
            matchResults = function () {
                if (!$scope.firstInningsComplete) {
                    $scope.firstInningsComplete = true;
                    $scope.resultsHeader = $scope.battingSideTitle.toUpperCase() + "  INNINGS OVER";
                    $scope.resultsContent1 = $scope.bowlingSideTitle.toUpperCase() + " HAS TO SCORE " + ($scope.currentTeamScore + 1) + " TO WIN"
                    $scope.resultsContent2 = $scope.bowlingSideTitle.toUpperCase() + " BATTING NOW";
                    $scope.openResultsModal();
                    resetAfterInnings();
                    $scope.teamBWinningsRuns = teamAScore + 1;
                } else {
                    $scope.matchOver = true;
                    matchSummary();
                }
            },
            matchEnd = function () {
                if ($scope.currentTeamPlayedOvers === parseFloat(Math.ceil($scope.totalInningsOvers)).toFixed(1)) {
                    matchResults();
                }
            },
            resetOver = function () {
                $scope.teamEachOver.push({"lastOverScore": $scope.currentOverScore, "isScoreObj": true});
                $scope.totalOversDetails.push(angular.copy($scope.teamEachOver));
                $scope.teamEachOver = [];
                $scope.ballCount = 0;
                $scope.extraBallCount = 0;
                $scope.currentOverScore = 0;
                $scope.currentTeamPlayedOvers = parseFloat(Math.ceil($scope.currentTeamPlayedOvers)).toFixed(1);
                console.log($scope.totalOversDetails);
            },
            matchAnalysis = function () {
                if ($scope.firstInningsComplete) {
                    $scope.teamBWinningsRuns = teamAScore + 1 - $scope.currentTeamScore;
                    if ($scope.teamBWinningsRuns <= 0) {
                        $scope.matchOver = true;
                        $scope.$apply();
                        $scope.teamEachOver.push({"lastOverScore": $scope.currentOverScore, "isScoreObj": true});
                        $scope.totalOversDetails.push(angular.copy($scope.teamEachOver));
                        matchResults();
                    }
                }
                if ($scope.ballCount === 6) {
                    resetOver();
                    matchEnd();
                }
                if ($scope.totalWickets === 10) {
                    resetOver();
                    matchResults();
                }
            },

            constructExcelData = function (array, teamId) {
                var output = '';
                if (teamId === "teamA") {
                    output += $scope.battingSideTitle === undefined ? " " : $scope.battingSideTitle.toUpperCase();
                    output += ',';
                    output += ',';
                    output += ',';
                    output += $scope.firstInningsComplete === true ? "SCORE " + teamAScore.toString() : "SCORE " + $scope.currentTeamScore.toString();
                    output += '/';
                    output += $scope.firstInningsComplete === true ?  teamAWickets.toString() : $scope.totalWickets.toString();
                    output += ',';
                    output += ',';
                    output += ',';
                    output += $scope.firstInningsComplete === true ?  "OVERS " + teamAPlayedOvers.toString() : "OVERS " + $scope.currentTeamPlayedOvers.toString();
                    output += ',';
                    output += '\n';

                }
                else if (teamId === "teamB") {
                    output += '\n';
                    output += '\n';
                    output += $scope.bowlingSideTitle === undefined ? " " : $scope.bowlingSideTitle.toUpperCase();
                    output += ',';
                    output += ',';
                    output += ',';
                    output += $scope.firstInningsComplete === true ? "SCORE " + $scope.currentTeamScore.toString() : "SCORE " + "0";
                    output += '/';
                    output += $scope.firstInningsComplete === true ?  $scope.totalWickets.toString()  :  "0";
                    output += ',';
                    output += ',';
                    output += ',';
                    output += $scope.firstInningsComplete === true ?  "OVERS " + $scope.currentTeamPlayedOvers.toString()  :  "OVERS " + "0";
                    output += ',';
                    output += '\n';
                }
                angular.forEach(array, function (object , index) {
                    output += "OVER - " + (parseInt(index) + 1) + ',';
                    angular.forEach(object, function (innerObj, key) {
                        angular.forEach(innerObj, function (value, key) {
                            if (key !== "$$hashKey") {
                                if (key === "ballCount") {
                                    output += value + ',';
                                }
                                if (key === "ballStatus") {
                                    output += value + ',';
                                }
                            }
                        });
                    });
                    output += '\n';
                });
                return output;
            },
            previousScore;
        $scope.firstInningsComplete = false;
        $scope.toggleCricMenu = false;
        $scope.showTourGuide = true;
        $scope.playStarted = false;
        $scope.totalInningsOvers = "";
        $scope.currentTeamScore = 0;
        $scope.totalOversDetails = [];
        $scope.totalWickets = 0;
        $scope.teamEachOver = [];
        $scope.ballCount = 0;
        $scope.currentTeamPlayedOvers = 0;
        $scope.extraBallCount = 0;
        $scope.currentOverScore = 0;
        $scope.matchOver = false;
        $scope.openMenu = function () {
            $scope.toggleCricMenu = !$scope.toggleCricMenu;
        };
        $scope.startPlay = function () {
                    $scope.resultsContent1 = " ";
                    $scope.resultsContent2 = " ";
            if ($scope.totalInningsOvers !== "") {
                if ($scope.teamA_Name !== undefined && $scope.teamB_Name !== undefined) {
                    if ($scope.chooseBattingSide !== undefined) {
                        $timeout(function () {
                            $scope.playStarted = true;
                        }, 1000);
                    } else {
                        $scope.resultsHeader = AlertMessage3;
                        $scope.openResultsModal();
                    }
                } else {
                    $scope.resultsHeader = AlertMessage2;
                    $scope.openResultsModal();
                }
            }
            else {
                $scope.resultsHeader = AlertMessage1;
                $scope.openResultsModal();
            }
        };
        $scope.exportToExcel = function () {
            var blob,
                anchor,
                clickEvent,
                exportScoreData;
            if ($scope.firstInningsComplete) {
                exportScoreData = constructExcelData($scope.firstInningsDetails, "teamA") +  constructExcelData($scope.totalOversDetails, "teamB");
            } else {
                exportScoreData = constructExcelData($scope.totalOversDetails, "teamA") +  constructExcelData([], "teamB");
            }
            if ($scope.matchOver) {
                exportScoreData += '\n';
                exportScoreData += '\n';
                exportScoreData += winningTeam;
            }
            if ($window.navigator.msSaveOrOpenBlob) {
                blob = new Blob([exportScoreData]);
                $window.navigator.msSaveOrOpenBlob(blob, 'CricScoreBoard.csv');
            }
            else {
                clickEvent = document.createEvent('MouseEvents');
                clickEvent.initEvent('click', true, true);
                anchor = angular.element(document.createElement('a'));
                anchor.attr({
                    href: 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(exportScoreData),
                    download: 'CricScoreBoard.csv'
                })[0].dispatchEvent(clickEvent);
                anchor.remove();
            }
            var ua = navigator.userAgent.toLowerCase();
            var isAndroid = ua.indexOf("android") > -1;
            if(isAndroid){
                Android.sendCsv(exportScoreData);
            }
        };
        $scope.newUpdateAdded = true;
        $scope.getBallStatus = function () {
            return $scope.newUpdateAdded;
        };
        $scope.backToTourGuide = function () {
            $scope._Index = 0;
            $scope.playStarted = true;
            $scope.showTourGuide = true;
            $scope.openMenu();
        };
        $scope.backToNewMatch = function () {
            $window.location.reload();
        };
        $scope.backToSettings = function () {
            $scope.playStarted = false;
            $scope.showTourGuide = false;
            $scope.openMenu();
        };
        $scope.startAfterTour = function () {
            $scope.playStarted = false;
            $scope.showTourGuide = false;
        };
        $scope.backToScoreBoard = function () {
            $scope.playStarted = true;
            $scope.showTourGuide = false;
            $scope.openMenu();
        };
        $scope.openResultsModal = function () {
            var modal = document.getElementById('resultsModal');
            var btn = document.getElementById("myBtn");
            var span = document.getElementsByClassName("resultsModal_close")[0];
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
            }
        };
        $scope.battingSideTitle = "Select Batting Side";
        $scope.battingSideChanged = function () {
            if ($scope.chooseBattingSide === "TEAMA") {
                $scope.battingSideTitle = $scope.teamA_Name === undefined ? "Select Batting Side " : $scope.teamA_Name;
                $scope.bowlingSideTitle = $scope.teamB_Name;
            } else {
                $scope.battingSideTitle = $scope.teamB_Name === undefined ? "Select Batting Side " : $scope.teamB_Name;
                $scope.bowlingSideTitle = $scope.teamA_Name;
            }
        };

        $scope.updateScore = function (val) {
            var ballObj = {};
            $scope.newUpdateAdded = false;
            if (!isNaN(val)) {
                $scope.currentTeamScore += val;
                $scope.currentOverScore += val;
                previousScore = val;
                $scope.ballCount += 1;
                $scope.currentTeamPlayedOvers = (parseFloat($scope.currentTeamPlayedOvers) + 0.1).toFixed(1);
                ballObj["ballCount"] = "Ball" + ($scope.ballCount);
                ballObj["ballStatus"] = val;
                $scope.teamEachOver.push(ballObj);
            } else {
                switch (val) {
                    case "UN":
                        //$scope.ballCount = $scope.teamEachOver[$scope.teamEachOver.length-1].ballStatus -1;
                        $scope.newUpdateAdded = true;
                        $scope.currentTeamPlayedOvers = (parseFloat($scope.currentTeamPlayedOvers) - 0.1).toFixed(1);
                        $scope.ballCount -= 1;
                        $scope.currentOverScore -= previousScore;
                        $scope.currentTeamScore -= previousScore;
                        console.log($scope.teamEachOver);
                        $scope.teamEachOver.pop();
                        //console.log($scope.teamEachOver);
                        $scope.$digest();
                        break;
                    default:
                        break;
                }
                //$scope.teamEachOver.push(ballObj);
            }
            $scope.$apply();
            //console.log($scope.teamEachOver);
            matchAnalysis();
        };
        $scope.showExtraRunPopup = function () {
            var i = 0;
            if (selectedIds.length > 0) {
                for(i = 0; i < selectedIds.length; i++) {
                    $("#" + selectedIds[i].id).removeClass('whiteColor wine').addClass('black');
                }
            }
            selectedIds = [];
            maxExtraBallsSelection = 0;
            $("#openExtraScore")[0].click();
        };

        $scope.updateExtraScore = function(val,elemId) {
            var i;
            if($("#"+elemId).hasClass('black')){
                if(maxExtraBallsSelection <2){
                    $("#"+elemId).addClass('whiteColor wine').removeClass('black');
                    maxExtraBallsSelection +=1;
                    selectedIds.push({"id":elemId,"value":val});
                }
            }else if($("#"+elemId).hasClass('whiteColor')){
                $("#"+elemId).removeClass('whiteColor wine').addClass('black');
                maxExtraBallsSelection -=1;
                for(i = 0; i < selectedIds.length; i++) {
                    if(selectedIds[i].id == elemId) {
                        selectedIds.splice(i, 1);
                        break;
                    }
                }
            }
        };

        $scope.gallery = [
            {src: './img/tour/CB1.png', desc: 'Image 01'},
            {src: './img/tour/CB2.png', desc: 'Image 02'},
            {src: './img/tour/CB3.png', desc: 'Image 03'},
            {src: './img/tour/CB4.png', desc: 'Image 04'},
            {src: './img/tour/CB5.png', desc: 'Image 05'},
            {src: './img/tour/CB6.png', desc: 'Image 06'}
        ];


        $scope.applyExtraScores = function () {
            var i,
             ballObj = {},extra1,extra2,extraRuns,applyExtras,noOfExtras = 0;
            console.log(selectedIds);
            $scope.newUpdateAdded = false;
            applyExtras = function (extra, extra2) {
                switch (extra) {
                    case "WICKET":
                        if(extra2 === ""){
                            $scope.totalWickets += 1;
                            $scope.ballCount += 1;
                            $scope.currentTeamScore += extraRuns;
                            $scope.currentOverScore += extraRuns;
                            ballObj["ballCount"] = "Ball" + ($scope.ballCount);
                            $scope.currentTeamPlayedOvers = (parseFloat($scope.currentTeamPlayedOvers) + 0.1).toFixed(1);
                            ballObj["ballStatus"] = "WK "+extraRuns;
                            ballObj["properBall"] = true;
                        }else{
                            if(extra2 ==="+ WB"){
                                $scope.totalWickets += 1;
                                $scope.currentTeamScore += 1;
                                $scope.currentOverScore += 1;
                                $scope.extraBallCount += 1;
                                previousScore = 1 + extraRuns;
                                ballObj["ballCount"] = "ExtraBall" + ($scope.extraBallCount);
                                ballObj["ballStatus"] = "WK WB";
                                ballObj["properBall"] = false;
                            }else if(extra2 ==="+ NB"){
                                $scope.totalWickets += 1;
                                $scope.currentTeamScore += 1;
                                $scope.currentOverScore += 1;
                                $scope.extraBallCount += 1;
                                previousScore = 1 + extraRuns;
                                ballObj["ballCount"] = "ExtraBall" + ($scope.extraBallCount);
                                ballObj["ballStatus"] = "WK NB";
                                ballObj["properBall"] = false;
                            }
                        }
                        break;
                    case "WB":
                        $scope.currentTeamScore += 1;
                        $scope.currentOverScore += 1;
                        $scope.extraBallCount += 1;
                        if(extra2 === "") {
                            $scope.currentTeamScore += extraRuns;
                            $scope.currentOverScore += extraRuns;
                            previousScore = 1 + extraRuns;
                            ballObj["ballCount"] = "ExtraBall" + ($scope.extraBallCount);
                            ballObj["ballStatus"] = "WB "+extraRuns;
                            ballObj["properBall"] = false;
                        }
                        else{
                            if(extra2 ==="+ WICKET"){
                                $scope.totalWickets += 1;
                                previousScore = 1 + extraRuns;
                                ballObj["ballCount"] = "ExtraBall" + ($scope.extraBallCount);
                                ballObj["ballStatus"] = "WB WK";
                                ballObj["properBall"] = false;
                            }
                        }
                        break;
                    case "NB":
                        $scope.currentTeamScore += 1;
                        $scope.currentOverScore += 1;
                        $scope.extraBallCount += 1;
                        if(extra2 === "") {
                            $scope.currentTeamScore += extraRuns;
                            $scope.currentOverScore += extraRuns;
                            ballObj["ballCount"] = "ExtraBall" + ($scope.extraBallCount);
                            ballObj["ballStatus"] = "NB "+extraRuns;
                            previousScore = 1 + extraRuns;
                            ballObj["properBall"] = false;
                        }
                        else{
                            if(extra2 ==="+ WICKET"){
                                $scope.totalWickets += 1;
                                previousScore = 1 + extraRuns;
                                ballObj["ballCount"] = "ExtraBall" + ($scope.extraBallCount);
                                ballObj["ballStatus"] = "WB WK";
                                ballObj["properBall"] = false;
                            }
                        }
                        break;
                    case "LEGBYE":
                        if(extra2 === "") {
                            $scope.currentTeamScore += extraRuns;
                            $scope.currentOverScore += extraRuns;
                            previousScore = extraRuns;
                            $scope.ballCount += 1;
                            ballObj["ballCount"] = "B" + ($scope.ballCount);
                            $scope.currentTeamPlayedOvers = (parseFloat($scope.currentTeamPlayedOvers) + 0.1).toFixed(1);
                            ballObj["ballStatus"] = "BY "+extraRuns;
                            ballObj["properBall"] = true;
                        }
                        break;
                    case "BYE":
                        if(extra2 === "") {
                            $scope.currentTeamScore += extraRuns;
                            $scope.currentOverScore += extraRuns;
                            previousScore = extraRuns;
                            $scope.ballCount += 1;
                            ballObj["ballCount"] = "B" + ($scope.ballCount);
                            $scope.currentTeamPlayedOvers = (parseFloat($scope.currentTeamPlayedOvers) + 0.1).toFixed(1);
                            ballObj["ballStatus"] = "BY "+extraRuns;
                            ballObj["properBall"] = true;
                        }
                        break;
                    default :
                        break;
                }
                $scope.teamEachOver.push(ballObj);
                $scope.$apply();
                matchAnalysis();
                $("#closeExtra")[0].click();
            };
            for(i = 0; i < selectedIds.length; i++) {
                if(isNaN(selectedIds[i].value)) {
                      noOfExtras += 1;
                    if (noOfExtras === 2){
                        extra2 ="+ "+selectedIds[i].value;
                    }else{
                        extra1 = selectedIds[i].value;
                    }
                }else{
                    extraRuns = selectedIds[i].value;
                }
            }
            if(!extraRuns){
                extraRuns = 0;
            }
            if(!extra2){
                extra2 = "";
            }
            applyExtras(extra1,extra2);
        };
    }]).directive('numbersOnly', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    var transformedInput;
                    if (text) {
                        transformedInput = text.replace(/[^0-9]/g, '');
                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    return undefined;
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    }).filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    }).directive('gallery', function(){
        return {
            restrict: 'E',
            template: '<img ng-repeat="image in gallery" ng-src="{{image.src}}" class="gallery-item" ng-show="isActive($index)">'+
            '<a class="arrow prev" href="#" ng-click="showPrev()"></a>'
            +
            '<a class="arrow next" ng-hide="_Index === gallery.length - 1" href="#" ng-click="showNext()"></a>'
            +
            '<a class="arrow skip"  href="#"><button class="button button5" data-ng-click="startAfterTour()">Skip</button></a>'
            +
            '<a class="arrow start" ng-show="_Index === gallery.length - 1" href="#"><button class="button button5" data-ng-click="startAfterTour()">Start</button></a>',
            controller: ['$scope', '$http', function($scope, $http) {
                $scope._Index = 0;
                // if a current image is the same as requested image
                $scope.isActive = function (index) {
                    return $scope._Index === index;
                };
                // show prev image
                $scope.showPrev = function () {
                    $scope._Index = ($scope._Index > 0) ? --$scope._Index : $scope.gallery.length - 1;
                };
                // show next image
                $scope.showNext = function () {
                    $scope._Index = ($scope._Index < $scope.gallery.length - 1) ? ++$scope._Index : 0;
                };
            }]
        };
    });
}(angular));