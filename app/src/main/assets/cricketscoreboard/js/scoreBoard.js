/*global angular*/
(function(angular) {
    'use strict';
    var crickMeBoardApp = angular.module('crickMeBoardApp', []);
    crickMeBoardApp.controller('crickMeBoardController', ['$scope', '$http', '$templateCache', '$timeout','$window', function ($scope, $http, $templateCache, $timeout, $window) {
        $scope.firstInningsComplete = false
        var teamAScore,
            teamAWickets,
            teamAPlayedOvers,
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
            resetOver = function () {
            $scope.teamEachOver.push({"lastOverScore": $scope.currentOverScore, "isScoreObj": true});
            $scope.totalOversDetails.push(angular.copy($scope.teamEachOver));
            $scope.teamEachOver = [];
            $scope.ballCount = 0;
            $scope.extraBallCount = 0;
            $scope.currentOverScore = 0;
            $scope.currentTeamPlayedOvers = parseFloat(Math.ceil($scope.currentTeamPlayedOvers)).toFixed(1);
            console.log($scope.totalOversDetails);
                
            if($scope.currentTeamPlayedOvers === parseFloat(Math.ceil($scope.totalInningsOvers)).toFixed(1)){
                if(!$scope.firstInningsComplete){
                    $scope.firstInningsComplete = true;
                    //$("#openAlertsModel")[0].click();
                    alert($scope.battingSideTitle +"  innings Over");
                    alert($scope.currentTeamScore+1 + " TO WIN")
                    resetAfterInnings();
                }else{
                    alert($scope.bowlingSideTitle +"  innings Over");
                    alert("match Over");
                }
            }
        },
            
            constructExcelData = function (array, teamId) {
                var output = '';
                if (teamId === "teamA") {
                    output += $scope.battingSideTitle === undefined ? " " : $scope.battingSideTitle;
                    output += ',';
                    output += $scope.firstInningsComplete == true ? teamAScore : $scope.currentTeamScore;
                    output += "/" 
                    output += $scope.firstInningsComplete == true ? teamAWickets :  $scope.totalWickets;
                    output += ',';
                    output += '\n';
                }
                else if (teamId === "teamB") {
                    output += '\n';
                    output += '\n';
                    output += $scope.bowlingSideTitle === undefined ? " " : $scope.bowlingSideTitle;
                    output +=',';
                    output += $scope.firstInningsComplete == true ? $scope.currentTeamScore : 0;
                    output +="/" ;
                    output += $scope.firstInningsComplete == true ? $scope.totalWickets  :  0 ;
                    output +=',';
                    output += '\n';
                    output += '\n';
                }
                angular.forEach(array, function (object ,index) {
                    output += "OVER - " + index + ',';
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
        $scope.startPlay = function () {
            $timeout(function () {$scope.playStarted = true; }, 1000);
        };
        $scope.exportToExcel = function () {
            var blob,
                anchor,
                clickEvent,
                exportScoreData;
            if($scope.firstInningsComplete){
                exportScoreData = constructExcelData($scope.firstInningsDetails, "teamA") +  constructExcelData($scope.totalOversDetails, "teamB");
            }else{
                exportScoreData = constructExcelData($scope.totalOversDetails, "teamA") +  constructExcelData([], "teamB");
            }
                
            if ($window.navigator.msSaveOrOpenBlob) {
                blob = new Blob([data]);
                $window.navigator.msSaveOrOpenBlob(blob, 'CricScoreBoard.csv');
            }
            else {
                clickEvent = document.createEvent('MouseEvents');
                clickEvent.initEvent('click', true, true );
                anchor = angular.element(document.createElement('a'));
                anchor.attr({
                    href: 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(exportScoreData),
                    download: 'CricScoreBoard.csv'
                    })[0].dispatchEvent(clickEvent);
                anchor.remove();
            }
        };
        $scope.newUpdateAdded = true;
        $scope.getBallStatus = function () {
            return $scope.newUpdateAdded;
        };
        $scope.backToSettings = function () {
            $scope.playStarted = false;
        };
        $scope.battingSideTitle ="Select Batting Side";
        $scope.battingSideChanged = function() {
            if($scope.chooseBattingSide === "TEAMA"){
                $scope.battingSideTitle = $scope.teamA_Name === undefined ? "Select Batting Side " : $scope.teamA_Name;
                $scope.bowlingSideTitle = $scope.teamB_Name;
            }else{
                $scope.battingSideTitle = $scope.teamB_Name === undefined ? "Select Batting Side " : $scope.teamB_Name;
                $scope.bowlingSideTitle = $scope.teamA_Name;
            }
        };

        $scope.updateScore = function(val) {
            var ballObj = {};
            $scope.newUpdateAdded = false;
            if(!isNaN(val)) {
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
                        //$scope.$apply();
                        break;

                    default :
                }
                //$scope.teamEachOver.push(ballObj);
            }
            //console.log($scope.teamEachOver);
            if($scope.ballCount == 6) {
                resetOver();
            }
        };
        $scope.showExtraRunPopup = function () {
            if(selectedIds.length>0){
                for(var i=0;i<selectedIds.length;i++){
                    $("#"+selectedIds[i].id).removeClass('whiteColor wine').addClass('black');
                }
            }
            selectedIds = [];
            maxExtraBallsSelection = 0;
            $("#openExtraScore")[0].click();
        };
        var maxExtraBallsSelection = 0;
        var selectedIds = [];
        $scope.updateExtraScore = function(val,elemId) {
                if($("#"+elemId).hasClass('black')){
                    if(maxExtraBallsSelection <2){
                $("#"+elemId).addClass('whiteColor wine').removeClass('black');
                    maxExtraBallsSelection +=1;
                    selectedIds.push({"id":elemId,"value":val});
                    }
            }else if($("#"+elemId).hasClass('whiteColor')){
                $("#"+elemId).removeClass('whiteColor wine').addClass('black');
                maxExtraBallsSelection -=1;
                for(var i = 0; i < selectedIds.length; i++) {
                    if(selectedIds[i].id == elemId) {
                        selectedIds.splice(i, 1);
                        break;
                    }
                }
            }
        }
         $scope.applyExtraScores = function () {  
             console.log(selectedIds);
             var ballObj = {},extra,extraRuns;
             $scope.newUpdateAdded = false;
              for(var i = 0; i < selectedIds.length; i++) {
                    if(isNaN(selectedIds[i].value)) {
                        extra = selectedIds[i].value;
                    }else{
                        extraRuns = selectedIds[i].value;
                    }
                }
             if(!extraRuns){
                 extraRuns = 0;
             }
             switch (extra) {
                    case "WICKET":
                        $scope.totalWickets += 1;
                        $scope.ballCount += 1;
                        $scope.currentTeamScore += extraRuns;
                        $scope.currentOverScore += extraRuns;
                        ballObj["ballCount"] = "Ball" + ($scope.ballCount);
                        $scope.currentTeamPlayedOvers = (parseFloat($scope.currentTeamPlayedOvers) + 0.1).toFixed(1);
                        ballObj["ballStatus"] = "WK";
                        ballObj["properBall"] = true;
                        break;
                     case "WB":
                        $scope.currentTeamScore += 1;
                        $scope.currentTeamScore += extraRuns;
                        $scope.currentOverScore += 1;
                        $scope.currentOverScore += extraRuns;
                        $scope.extraBallCount += 1;
                        ballObj["ballCount"] = "ExtraBall" + ($scope.extraBallCount);
                        ballObj["ballStatus"] = "WB";
                        previousScore = 1+extraRuns;
                        ballObj["properBall"] = false;
                        break;
                    case "NB":
                        $scope.currentTeamScore += 1;
                        $scope.currentTeamScore += extraRuns;
                        $scope.currentOverScore += 1;
                        $scope.currentOverScore += extraRuns;
                        $scope.extraBallCount += 1;
                        ballObj["ballCount"] = "ExtraBall" + ($scope.extraBallCount);
                        ballObj["ballStatus"] = "NB";
                        previousScore = 1+extraRuns;
                        ballObj["properBall"] = false;
                        break;
                    case "LEGBYE":
                        $scope.currentTeamScore += extraRuns;
                        $scope.currentOverScore += extraRuns;
                        previousScore = extraRuns;
                        $scope.ballCount += 1;
                        ballObj["ballCount"] = "B" + ($scope.ballCount);
                        $scope.currentTeamPlayedOvers = (parseFloat($scope.currentTeamPlayedOvers) + 0.1).toFixed(1);
                        ballObj["ballStatus"] = "BY";
                        ballObj["properBall"] = true;
                        break;
                     case "BYE":
                        $scope.currentTeamScore += extraRuns;
                        $scope.currentOverScore += extraRuns;
                        previousScore = extraRuns;
                        $scope.ballCount += 1;
                        ballObj["ballCount"] = "B" + ($scope.ballCount);
                        $scope.currentTeamPlayedOvers = (parseFloat($scope.currentTeamPlayedOvers) + 0.1).toFixed(1);
                        ballObj["ballStatus"] = "BY";
                        ballObj["properBall"] = true;
                        break;
             }
            $scope.teamEachOver.push(ballObj);
         if($scope.ballCount == 6) {
            resetOver();
         }
            $("#closeExtra")[0].click();
        };
    }]).directive('numbersOnly', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9]/g, '');
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
    });
}(angular));