


####################################################
# Library Declarations 
if(TRUE){

    source('./r_files/flatten_HTML.r')
    Sys.setlocale("LC_ALL","English")    
    
    libraryRequireInstall("zoo")
    libraryRequireInstall("plotly")
    libraryRequireInstall("forecast")  
    libraryRequireInstall("lubridate")

}



####################################################
# Display Error Message
defaultMessage = function(e){
  
    ax <- list(
        title          = sprintf("ERROR: %s",e),
        zeroline       = FALSE,
        showline       = FALSE,
        showticklabels = FALSE,
        showgrid       = FALSE
    )
    
    ay <- list(
        title          = "",
        zeroline       = FALSE,
        showline       = FALSE,
        showticklabels = FALSE,
        showgrid       = FALSE
    )
    
    p <- plot_ly(      
    )%>%
    layout(
        title = '',
        xaxis = ax, 
        yaxis = ay
    )
    
    internalSaveWidget(p, 'out.html');
    quit()
  
}



#-------------------------------------------------------------------------------------------------------------------



####################################################
# Settings
if(TRUE){

    tryCatch(
        {

            ####################################################
            # Date Settings
            if(TRUE){
                
                tryCatch(
                    {
                        
                        ####################################################
                        # Parse date
                        parseDate = function(date){
                            
                            date    <- trimws(date)


                            ####################################################
                            # Try Daily               
                            if(TRUE){

                                dateDaily = list(

                                    c("17-11-2018 00:00" , "%d/%m/%Y 00:00"),                                    
                                    
                                    c("17/11/2018"       , "%d/%m/%Y"),
                                    c("17/11/18"         , "%d/%m/%y"),    #Which century?
                                    
                                    c("2018/11/17"       , "%Y/%m/%d"),
                                    c(  "18/11/17"       , "%y/%m/%d"),    #Which century?
                                    
                                    c("11/17/2018"       , "%m/%d/%Y"),
                                    c("11/17/18"         , "%m/%d/%y"),    #Which century?
                                    
                                    c("17/Nov/2018"      , "%d/%b/%Y"),
                                    c("17/Nov/18"        , "%d/%b/%y"),
                                    
                                    c("17/November/2018" , "%d/%B/%Y"),
                                    c("17/November/18"   , "%d/%B/%y"),
                                    
                                    
                                    c("17-11-2018"       , "%d-%m-%Y"),
                                    c("17-11-18"         , "%d-%m-%y"),    #Which century?
                                    
                                    c("2018-11-17"       , "%Y-%m-%d"),
                                    c(  "18-11-17"       , "%y-%m-%d"),    #Which century?
                                    
                                    c("11-17-2018"       , "%m-%d-%Y"),
                                    c("11-17-18"         , "%m-%d-%y"),    #Which century?
                                    
                                    c("17-Nov-2018"      , "%d-%b-%Y"),
                                    c("17-Nov-18"        , "%d-%b-%y"),
                                    
                                    c("17-November-2018" , "%d-%B-%Y"),
                                    c("17-November-18"   , "%d-%B-%y"),
                                    
                                    
                                    c(     "17Nov,2018"  , "%d%b,%Y"),
                                    c("17November,2018"  , "%d%B,%Y")                    
                                )
                                
                                for(i in 1:length(dateDaily)){
                                    format <- dateDaily[[i]][2]
                                    parsedDate <- as.POSIXct(strptime(date,format = format))
                                    
                                    if(!is.na(parsedDate)){
                                        return(parsedDate)
                                    }
                                }
                                
                            }


                            ####################################################
                            # Try Month
                            if(TRUE){

                                dateMon = list(
                                    c("2018M11"       , "%YM%m" ),
                                    c("2018-11"       , "%Y-%m" ),
                                    c("2018-Nov"      , "%Y-%b" ),
                                    c("2018-November" , "%Y-%B" ),
                                    
                                    c(      "11-2018" , "%m-%Y" ),
                                    c(     "Nov-2018" , "%b-%Y" ),
                                    c("November-2018" , "%B-%Y" ),
                                    
                                    c("2018/11"       , "%Y/%m" ),
                                    c("2018/Nov"      , "%Y/%b" ),
                                    c("2018/November" , "%Y/%B" ),
                                    
                                    c(      "11/2018" , "%m/%Y" ),
                                    c(     "Nov/2018" , "%b/%Y" ),
                                    c("November/2018" , "%B/%Y" ),
                                    
                                    c(     "Nov,2018" , "%b,%Y" ),
                                    c("November,2018" , "%B,%Y" ),
                                    
                                    c("2018,Nov"      , "%Y,%b" ),
                                    c("2018,November" , "%Y,%B" )                    
                                )
                                
                                for(i in 1:length(dateMon)){
                                    format  <- dateMon[[i]][2]                    
                                    parsedDate <- as.Date(as.yearmon(date,format),units="day")
                                
                                    if(!is.na(parsedDate)){
                                        return(parsedDate)
                                    }
                                }
                            }  
                            

                            ####################################################
                            # Try Quarter
                            if(TRUE){

                                dateQtr = list(
                                    c("2018 q1"       , "%Y q%q"       ),
                                    c("2018Q1"        , "%YQ%q"       ),
                                    c("2018 Q1"       , "%Y Q%q"       ),
                                    c("2018 quarter1" , "%Y quarter%q" ),
                                    c("2018 Quarter1" , "%Y Quarter%q" ),
                                    
                                    c("2018/q1"       , "%Y/q%q"       ),
                                    c("2018/Q1"       , "%Y/Q%q"       ),
                                    c("2018/quarter1" , "%Y/quarter%q" ),
                                    c("2018/Quarter1" , "%Y/Quarter%q" ),
                                    
                                    c("2018-q1"       , "%Y-q%q"       ),
                                    c("2018-Q1"       , "%Y-Q%q"       ),
                                    c("2018-quarter1" , "%Y-quarter%q" ),
                                    c("2018-Quarter1" , "%Y-Quarter%q" )                    
                                )
                                
                                for(i in 1:length(dateQtr)){
                                    format  <- dateQtr[[i]][2]
                                    parsedDate <- as.Date(as.yearqtr(date,format),units="day")
                                
                                    if(!is.na(parsedDate)){
                                        return(parsedDate)
                                    }
                                }

                            }  
                                                       

                            ####################################################
                            # Try Week
                            if(TRUE){

                                dateWeek = list( 
                                    c("2018-W36"       , "%Y-W%U%u"    ),
                                    c("2018-w36"       , "%Y-w%U%u"    ),
                                    c("2018-Week36"    , "%Y-Week%U%u" ),
                                    c("2018-week36"    , "%Y-week%U%u" ),
                                    
                                    c("2018/W36"       , "%Y/W%U%u"    ),
                                    c("2018/w36"       , "%Y/w%U%u"    ),
                                    c("2018/Week36"    , "%Y/Week%U%u" ),
                                    c("2018/week36"    , "%Y/week%U%u" )                    
                                )
                                
                                for(i in 1:length(dateWeek)){
                                    date    <- paste(date,'1',sep="")
                                    format  <- dateWeek[[i]][2]
                                    parsedDate <- as.Date(date,format)
                                    
                                    if(!is.na(parsedDate)){
                                        return(parsedDate)
                                    }
                                }

                            }  
                          
                            
                            return(NA)
                        }


                        ####################################################
                        # Calculate Frequency
                        calFreq = function(Time){
                            
                            date1 <- as.POSIXct(parseDate(Time[1,]))
                            date2 <- as.POSIXct(parseDate(Time[2,]))
                            

                            if(is.na(date1) || is.na(date2)){
                                defaultMessage("Please enter a valid date format.")
                            }

                            diff <- abs(
                                as.numeric(
                                difftime(date1,date2),
                                units="days"
                                )
                            )
                            
                            season     <- c(120,30,7,1)
                            frequency  <- c(4,12,52,365)
                            diffSeason <- abs(season-diff)
                            minDiff    <- min(diffSeason)
                            
                            tsFreq    <- frequency[match(minDiff,diffSeason)]
                            StartOff  <- 1
                            Start     <- format(date1,"%Y")
                            
                            
                            if(tsFreq == 4){
                                StartOff  <- quarter(date1)
                            }else if(tsFreq == 12){
                                StartOff  <- month(date1)
                            }else if(tsFreq == 52){
                                StartOff  <- week(date1)
                            }else if(tsFreq == 365){
                                StartOff  <- yday(date1)
                            }
                            
                            dateSettings <- c(tsFreq,StartOff,Start)
                            
                            return(dateSettings)

                        }


                        dateSettings <- calFreq(Value1)

                        tsFreq    <- as.numeric(dateSettings[1]) 
                        StartOff  <- as.numeric(dateSettings[2])
                        Start     <- as.numeric(dateSettings[3])

                    },
                    error=function(e){    
                        defaultMessage(e) 
                    }
                )

            }
            

            ####################################################
            # Forecast Settings
            if(TRUE){
                
                algorithm <- "LR";
                if(exists("forecastSettings_method")){
                    algorithm <- forecastSettings_method
                }


                split <- 0.75
                if(exists("forecastSettings_split")){
                    split <- as.numeric(forecastSettings_split)       
                }

                total_Rows <- NROW(Value1)
                train_Rows <- floor(split*total_Rows)
                test_Rows  <- total_Rows - train_Rows


                units <- max(test_Rows,tsFreq)
                if(exists("forecastSettings_units") && forecastSettings_units > 0){
                    units <- max(min(forecastSettings_units,500),10)
                }


                confInterval <- FALSE
                if(exists("forecastSettings_confInterval")){
                    confInterval <-forecastSettings_confInterval
                }

                
                confLevel <- 0.80
                if(exists("forecastSettings_confLevel")){
                    confLevel <- as.numeric(forecastSettings_confLevel)
                }


                ts_biasAdj <- FALSE
                if(exists("forecastSettings_biasAdj")){
                    ts_biasAdj <-forecastSettings_biasAdj
                }

            }


            ####################################################
            # Model Tuning 
            if(TRUE){

                modelTuning <- "auto"
                if(exists("modelSettings_modelTuning")){
                    modelTuning <- modelSettings_modelTuning
                }


                ####################################################
                # Exponential Smoothing
                if(TRUE){

                    es_errorType <- 'Z'
                    if(exists("modelSettings_errorType")){
                        es_errorType <- modelSettings_errorType
                    }


                    es_trendType <- 'Z'
                    if(exists("modelSettings_trendType")){
                        es_trendType <- modelSettings_trendType
                    }
                    es_ets <- paste(es_errorType,es_trendType,'N',sep="")


                    es_sWindow <- "periodic"
                    if(exists("modelSettings_sWindow")){
                        if(modelSettings_sWindow == "numeric"){
                            
                            es_sWindow <- 10
                            if(exists("modelSettings_sWindowValue")){
                                es_sWindow <- modelSettings_sWindowValue
                            }

                        }else{
                            es_sWindow <- "periodic"
                        }
                    }


                    es_tWindow <- NULL
                    if(exists("modelSettings_tWindow")){
                        if(modelSettings_tWindow == "numeric"){
                            
                            es_tWindow <- 10
                            if(exists("modelSettings_tWindowValue")){
                                es_tWindow <- modelSettings_tWindowValue
                            }

                        }else{
                            es_tWindow <- NULL
                        }
                    }


                    es_robust <- "false"                
                    if(exists("modelSettings_robust")){
                        es_robust <- modelSettings_robust                                     
                    }                

                }


                ####################################################
                # Neural Networks
                if(TRUE){

                    nn_decay <- 0.009
                    if(exists("modelSettings_decay") && modelSettings_decay <= 1 && modelSettings_decay >= 0){
                        nn_decay <- modelSettings_decay
                    }


                    nn_maxit <- 200
                    if(exists("modelSettings_maxit") && modelSettings_maxit > 0){
                        nn_maxit <- modelSettings_maxit
                    }


                    nn_size <- 20
                    if(exists("modelSettings_size") && modelSettings_size >0){
                        nn_size <- modelSettings_size
                    }


                    nn_repeats <- 20
                    if(exists("modelSettings_repeats") && modelSettings_repeats >0){
                        nn_repeats <- modelSettings_repeats
                    }
                
                }


                ####################################################
                # ARIMA
                if(TRUE){

                    ####################################################

                    ar_maxp  <- 3
                    if(exists("modelSettings_maxp")){
                        ar_maxp <- modelSettings_maxp
                    }


                    ar_maxq  <- 3
                    if(exists("modelSettings_maxq")){
                        ar_maxq <- modelSettings_maxq
                    }


                    ar_maxd  <- 2
                    if(exists("modelSettings_maxd")){
                        ar_maxd <- modelSettings_maxd
                    } 

                    ####################################################

                    ar_maxP <- 2
                    if(exists("modelSettings_maxP")){
                        ar_maxP <- modelSettings_maxP
                    }


                    ar_maxQ  <- 2
                    if(exists("modelSettings_maxQ")){
                        ar_maxQ <- modelSettings_maxQ
                    }


                    ar_maxD  <- 1
                    if(exists("modelSettings_maxD")){
                        ar_maxD <- modelSettings_maxD
                    } 

                    ####################################################

                    ar_seasonal  <- TRUE
                    if(exists("modelSettings_seasonal")){
                        ar_seasonal <- modelSettings_seasonal
                    }
                        

                    ar_allowDrift <- FALSE
                    if(exists("modelSettings_allowDrift")){
                        ar_allowDrift <- modelSettings_allowDrift
                    }


                    ar_allowMean <- FALSE
                    if(exists("modelSettings_allowMean")){
                        ar_allowMean <- modelSettings_allowMean
                    }


                    ar_stepWise <- TRUE  
                    if(exists("modelSettings_stepWise")){
                        ar_stepWise <- modelSettings_stepWise
                    }

                }

            }


            ####################################################
            # Plot Settings 
            if(TRUE){

                ####################################################
                # Plot Settings 
                if(TRUE){

                    title <- 'Forecast'
                    if(exists("plotSettings_title")){
                        title <- plotSettings_title
                    }


                    plotColor <- "#FFFFFF"
                    if(exists("plotSettings_plotColor")){
                        plotColor <- plotSettings_plotColor
                    }                

                    ####################################################

                    forecastLineCol <- "#F2C80F"
                    if(exists("plotSettings_fline")){
                        forecastLineCol <- plotSettings_fline
                    }


                    historyLineCol <- "#01B8AA"
                    if(exists("plotSettings_hline")){
                        historyLineCol <- plotSettings_hline
                    }

                   confRibCol <- "#F9F9F9"
                    if(exists("plotSettings_cline")){
                        confRibCol <- plotSettings_cline
                    }

                    ####################################################

                    forecastLineText <- "Predicted"
                    if(exists("plotSettings_flineText")){
                        forecastLineText <- plotSettings_flineText
                    }


                    historyLineText <- "Observed"
                    if(exists("plotSettings_hlineText")){
                        historyLineText <- plotSettings_hlineText
                    }

                }


                ####################################################
                # X axis settings
                if(TRUE){

                    xTitle <- 'Time'
                    if(exists("xaxisSettings_xTitle")){
                        xTitle <- xaxisSettings_xTitle
                    }


                    xZeroline <- TRUE
                    if(exists("xaxisSettings_xZeroline")){
                        xZeroline <- xaxisSettings_xZeroline
                    }


                    xLabels <- TRUE
                    if(exists("xaxisSettings_xLabels")){
                        xLabels <- xaxisSettings_xLabels
                    }

                    ####################################################

                    xGrid <- TRUE
                    if(exists("xaxisSettings_xGrid")){
                        xGrid <- xaxisSettings_xGrid
                    }


                    xGridCol <- "#BFC4C5"
                    if(exists("xaxisSettings_xGridCol")){
                        xGridCol <- xaxisSettings_xGridCol
                    }


                    xGridWidth <- 0.1
                    if(exists("xaxisSettings_xGridWidth")){
                        xGridWidth <- min(xaxisSettings_xGridWidth,20)
                    }

                    ####################################################

                    xAxisBaseLine <- TRUE
                    if(exists("xaxisSettings_xAxisBaseLine")){
                        xAxisBaseLine <- xaxisSettings_xAxisBaseLine
                    }


                    xAxisBaseLineCol <- "#000000"
                    if(exists("xaxisSettings_xAxisBaseLineCol")){
                        xAxisBaseLineCol <- xaxisSettings_xAxisBaseLineCol
                    }


                    xAxisBaseLineWidth <- 4
                    if(exists("xaxisSettings_xAxisBaseLineWidth")){
                        xAxisBaseLineWidth <- min(xaxisSettings_xAxisBaseLineWidth,20)
                    }

                }


                ####################################################
                # Y axis settings 
                if(TRUE){

                    yTitle <- 'Values'
                    if(exists("yaxisSettings_yTitle")){
                        yTitle <- yaxisSettings_yTitle
                    }                     


                    yZeroline <- TRUE
                    if(exists("yaxisSettings_yZeroline")){
                        yZeroline <- yaxisSettings_yZeroline
                    }


                    yLabels <- TRUE
                    if(exists("yaxisSettings_yLabels")){
                        yLabels <- yaxisSettings_yLabels
                    }

                    ####################################################

                    yGrid <- TRUE
                    if(exists("yaxisSettings_yGrid")){
                        yGrid <- yaxisSettings_yGrid
                    }


                    yGridCol <- "#BFC4C5"
                    if(exists("yaxisSettings_yGridCol")){
                        yGridCol <- yaxisSettings_yGridCol
                    }


                    yGridWidth <- 0.1
                    if(exists("yaxisSettings_yGridWidth")){
                        yGridWidth <- min(yaxisSettings_yGridWidth,20)
                    }

                    ####################################################

                    yAxisBaseLine <- TRUE
                    if(exists("yaxisSettings_yAxisBaseLine")){
                        yAxisBaseLine <- yaxisSettings_yAxisBaseLine
                    }


                    yAxisBaseLineCol <- "#000000"
                    if(exists("yaxisSettings_yAxisBaseLineCol")){
                        yAxisBaseLineCol <- yaxisSettings_yAxisBaseLineCol
                    }


                    yAxisBaseLineWidth <- 4
                    if(exists("yaxisSettings_yAxisBaseLineWidth")){
                        yAxisBaseLineWidth <- min(yaxisSettings_yAxisBaseLineWidth,20)
                    }

                }


                ####################################################
                #Define axis aesthetics
                if(TRUE){

                    ax <- list(
                        title          = xTitle,
                        zeroline       = xZeroline,
                        showticklabels = xLabels,
                        
                        showgrid       = xGrid,
                        gridcolor      = toRGB(xGridCol),
                        gridwidth      = xGridWidth,
                        
                        showline       = xAxisBaseLine,
                        linecolor      = toRGB(xAxisBaseLineCol),
                        linewidth      = xAxisBaseLineWidth
                    )


                    ay <- list(
                        title          = yTitle,
                        zeroline       = yZeroline,
                        showticklabels = yLabels,
                        
                        showgrid       = yGrid,
                        gridcolor      = toRGB(yGridCol),
                        gridwidth      = yGridWidth,
                        
                        showline       = yAxisBaseLine,
                        linecolor      = toRGB(yAxisBaseLineCol),
                        linewidth      = yAxisBaseLineWidth
                    )

                }

            }

        },
        error=function(e){    
            defaultMessage(e) 
        }  
    )

}



####################################################
# Common code
if(TRUE){

    tryCatch(
        {

            ####################################################
            # Prepare Time Sries      
            if(TRUE){

                tsSeries <- ts(
                    data      = Value2[1:train_Rows,],
                    start     = c(Start,StartOff),
                    frequency = tsFreq
                )                

                tsSeriesNew <- ts(
                    data      = Value2,
                    start     = c(Start,StartOff),
                    frequency = tsFreq
                )

            }


            ####################################################
            # Calculate Forecasted Dates
            if(TRUE){

                tsLength  <- length(tsSeries)

                forecastedDates <- seq(
                    time(tsSeries)[tsLength],
                    by  = time(tsSeries)[tsLength] - time(tsSeries)[tsLength-1], 
                    len = units+1
                )
                
            }


            ####################################################
            # Calculate Box Cox Transformation parameter
            if(TRUE){

                ts_lambda <- NULL
                if(exists("forecastSettings_lambda")){

                    if(forecastSettings_lambda == "NULL"){
                        ts_lambda <- NULL
                    }else if(forecastSettings_lambda == "auto"){
                        ts_lambda <- BoxCox.lambda(
                            tsSeries,
                            method = "loglik", 
                            lower  = -1, 
                            upper  = 2
                        )
                    }else{
                        if(exists("forecastSettings_lambdaValue")){
                            ts_lambda <- max(-5,min(forecastSettings_lambdaValue,5))
                        }
                    }             

                }

            }

        },
        error=function(e){    
            defaultMessage(e) 
        } 
    )

}



#-------------------------------------------------------------------------------------------------------------------



####################################################
# Exponential Smoothing
if(algorithm == "ES"){

    tryCatch(
        {

            ####################################################
            # Less than 2 periods
            if(length(tsSeries) <= tsFreq*2){
                defaultMessage("Not enough data points (should be more than 2*frequency) \n Increase split point or provide more data.")
            }


            ####################################################
            # Train model and make prediction
            if(TRUE){

                if(modelTuning == "auto"){

                    tsPred <- stlf(
                        tsSeries,
                        
                        h     = units,
                        level = confLevel,

                        lambda  = ts_lambda,
                        biasadj = ts_biasAdj
                    )

                }else{

                    tsPred <- stlf(
                        tsSeries,
                        
                        etsmodel = es_ets,
                        s.window = es_sWindow,
                        t.window = es_tWindow,
                        robust   = es_robust,
                        
                        h     = units,
                        level = confLevel,

                        lambda  = ts_lambda,
                        biasadj = ts_biasAdj
                    )

                }      

            } 
            
        },
        error=function(e){    
            defaultMessage(e)        
        }
    )

}



####################################################
# Linear Regression
if(algorithm == "LR"){

    tryCatch(
        {
            
            ####################################################
            # Train model and make prediction
            if(TRUE){

                tsModel <- tslm(
                    tsSeries ~ (0+trend+season),

                    lambda  = ts_lambda,
                    biasadj = ts_biasAdj
                )

                tsPred  <- forecast(
                    tsModel,
                    h     = units,
                    level = confLevel
                )

            }
            
        },
        error=function(e){    
            defaultMessage(e)        
        }
    )

}



####################################################
# Neural Networks
if(algorithm == "NN"){

    tryCatch(
        {
            
            ####################################################
            # Train model and make prediction
            if(TRUE){
                
                if(modelTuning == "auto"){

                    tsModel <- nnetar(
                        tsSeries,

                        lambda  = ts_lambda,
                        biasadj = ts_biasAdj
                    )
                    
                }else{

                    tsModel  <- nnetar(
                        tsSeries,

                        decay   = nn_decay,
                        maxit   = nn_maxit,
                        size    = nn_size,
                        repeats = nn_repeats,     

                        lambda  = ts_lambda,
                        biasadj = ts_biasAdj
                    )

                }
                
                tsPred  <- forecast(
                    tsModel,
                    h     = units,
                    PI    = confInterval,
                    level = confLevel
                )

            }
    
        },
        error=function(e){    
            defaultMessage(e)        
        }
    )

}



####################################################
# ARIMA 
if(algorithm == "ARIMA"){

    tryCatch(
        {

            ####################################################
            # Train model and make prediction
            if(TRUE){

                if(modelTuning == "auto"){

                    tsModel <- auto.arima(
                        tsSeries,

                        lambda  = ts_lambda,
                        biasadj = ts_biasAdj
                    )

                }else{

                    tsModel <- auto.arima(
                        tsSeries, 
                        
                        max.p = ar_maxp,
                        max.q = ar_maxq, 
                        max.d = ar_maxd, 
                        
                        max.P = ar_maxP, 
                        max.Q = ar_maxQ,
                        max.D = ar_maxD,
                        
                        seasonal   = ar_seasonal,
                        allowdrift = ar_allowDrift, 
                        allowmean  = ar_allowMean,        
                        stepwise = ar_stepWise,

                        lambda  = ts_lambda,
                        biasadj = ts_biasAdj
                    )

                }         
                
                tsPred  <- forecast(
                    tsModel,
                    h     = units,
                    level = confLevel
                )

            }            

        },
        error=function(e){    
            defaultMessage(e)        
        }
    )

}



#-------------------------------------------------------------------------------------------------------------------



####################################################
#Plot
if(TRUE){

    tryCatch(
        {

            ####################################################
            # Calculate Accuracy
            if(TRUE){

                if(test_Rows==0){
                    titleText <- paste(title,' (',algorithm,')',sep="")
                }else{
                    actual <- tsSeriesNew[train_Rows+1:test_Rows]
                    pred   <- tsPred$mean
                    
                    len    <- min(length(actual),length(pred))
                    actual <- actual[1:len]
                    pred   <- pred[1:len]
                    
                    
                    a  <- round(accuracy(pred,actual),2)
                    
                    MEAN   <- round(mean(tsSeriesNew),2)
                    RMSE   <- a[2]
                    MAPE   <- a[5]

                    titleText <- paste(title,' (',algorithm,')',sep="")
                    titleText <- paste(titleText,'\nERROR: ',MEAN,' +/- ',RMSE,sep="")
                    titleText <- paste(titleText,'\nMAPE: ' ,MAPE,sep="")
                }

            }


            ####################################################
            # Plot Parameters
            if(TRUE){
        
                len <- length(tsPred$mean)
                
                tsPredMean          <- list(rep(0,len+1))
                tsPredMean          <- tsPredMean[[1]]
                tsPredMean[1]       <- tsSeries[tsLength] 
                tsPredMean[1:len+1] <- tsPred$mean

                if(confInterval == TRUE){
                    
                    tsPredLower          <- list(rep(0,len+1))
                    tsPredLower          <- tsPredLower[[1]]
                    tsPredLower[1]       <- tsSeries[tsLength] 
                    tsPredLower[1:len+1] <- tsPred$lower
                    
                    tsPredUpper          <- list(rep(0,len+1))
                    tsPredUpper          <- tsPredUpper[[1]]
                    tsPredUpper[1]       <- tsSeries[tsLength] 
                    tsPredUpper[1:len+1] <- tsPred$upper
                
                    ribbonFrame           <- data.frame(forecastedDates,tsPredLower,tsPredUpper)
                    colnames(ribbonFrame) <- c("xValues","yMin","yMax") 

                }
                
            }                
           
            
            ####################################################
            # Plot 
            if(TRUE){

                if(confInterval == TRUE){

                    p <- plot_ly(
                    )%>%                      
                    add_ribbons(
                        x     = ribbonFrame$xValues,
                        ymin  = ribbonFrame$yMin,
                        ymax  = ribbonFrame$yMax,
                        color = I(confRibCol),
                        name  = "Confidence"
                    )%>%     
                    add_lines(
                        x     = time(tsSeries), 
                        y     = tsSeries,
                        color = I(historyLineCol), 
                        name  = historyLineText 
                    )%>%             
                    add_lines(
                        x     = forecastedDates, 
                        y     = tsPredMean, 
                        color = I(forecastLineCol), 
                        name  = forecastLineText
                    )%>%                    
                    layout(
                        title  = titleText,
                        titlefont = list(
                            size = 12
                        ),
                        xaxis  = ax, 
                        yaxis  = ay,
                        textposition = 'middle',
                        margin = list(
                            l = 60,
                            r = 0,
                            t = 80,
                            b = 60
                        ),   
                        font = list(
                            family = "Arial",
                            size = 10
                        ),           
                        plot_bgcolor = plotColor
                    )

                }else{

                    p <- plot_ly(

                    )%>%
                    add_lines(
                        x     = time(tsSeries), 
                        y     = tsSeries,
                        color = I(historyLineCol), 
                        name  = historyLineText 
                    )%>% 
                    add_lines(
                        x     = forecastedDates, 
                        y     = tsPredMean, 
                        color = I(forecastLineCol), 
                        name  = forecastLineText
                    )%>%
                    layout(
                        title  = titleText,
                        titlefont = list(
                            size = 12
                        ),
                        xaxis  = ax, 
                        yaxis  = ay,
                        textposition = 'middle',
                        margin = list(
                            l = 60,
                            r = 0,
                            t = 80,
                            b = 60
                        ),   
                        font = list(
                            family = "Arial",
                            size = 10
                        ),           
                        plot_bgcolor = plotColor
                    )                     

                }

                internalSaveWidget(p, 'out.html');
                quit()

            }
        
        },
        error=function(e){    
            defaultMessage(e)        
        }
    )

}   