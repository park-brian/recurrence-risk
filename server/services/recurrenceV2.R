# To improve load times, replace library() imports with direct references to functions.
# eg: instead of "library(RecurRisk); recurrisk.group(...)", use: "RecurRisk::recurrisk.group(...)"

ping <- function() {
  TRUE
}

getRiskFromGroupData <- function(
  seerStatData,
  canSurvData,
  stageVariable,
  distantStageValue,
  adjustmentFactorR = 1,
  followUpYears = 25,
  ...
) {
  columns <- colnames(seerStatData)
  output <- RecurRisk::recurrisk.group(
    data = seerStatData,
    data.cansurv = canSurvData,
    stagevar = intersect(stageVariable, columns),
    stage.dist.value = as.numeric(distantStageValue),
    adj.r = as.numeric(adjustmentFactorR)
  )

  output[which(output$followup <= as.numeric(followUpYears)),]
}

getRiskFromIndividualData <- function(
  individualData,
  strata = NULL,
  covariates = NULL,
  timeVariable,
  eventVariable,
  stageVariable,
  distantStageValue,
  adjustmentFactorR = 1,
  distribution = "Log-logistic",
  followUpYears = 25,
  ...
) {
  columns <- colnames(individualData)
  output <- RecurRisk::recurrisk.individual(
    data = individualData,
    stratum = intersect(strata, columns),
    covar = intersect(covariates, columns),
    timevar = intersect(timeVariable, columns),
    eventvar = intersect(eventVariable, columns),
    stagevar = intersect(stageVariable, columns),
    stage.dist.value = distantStageValue,
    link = if (distribution %in% c("Log-logistic", "Weibull")) 
      distribution else "Log-logistic",
    adj.r = as.numeric(adjustmentFactorR)
  )

  output[which(output$followup <= as.numeric(followUpYears)),]
}
