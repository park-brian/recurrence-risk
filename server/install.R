install.packages(
  c(
    "jsonlite",
    "remotes"
  ), 
  repos = "https://cloud.r-project.org/"
)

remotes::install_github(
  c(
    "cran/SEER2R", 
    "cran/RecurRisk"
  )
)