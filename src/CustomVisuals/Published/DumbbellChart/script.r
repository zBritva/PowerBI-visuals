# Copyright (c) MAQ Software.  All rights reserved.

# Third Party Programs. This software enables you to obtain software applications from other sources.
# Those applications are offered and distributed by third parties under their own license terms.
# MAQ Software is not developing, distributing or licensing those applications to you, but instead,
# as a convenience, enables you to use this software to obtain those applications directly from
# the application providers.
# By using the software, you acknowledge and agree that you are obtaining the applications directly
# from the third party providers and under separate license terms, and that it is your responsibility to locate,
# understand and comply with those license terms.
# Microsoft grants you no license rights for third-party software or applications that is obtained using this software.

#
# WARNINGS:
#
# CREATION DATE: 06/12/2017
#
# LAST UPDATE: --/--/---
#
# VERSION: 3.0.0
#
# R VERSION TESTED: 3.4.2
#
# AUTHOR: MAQ Software



source('./r_files/flatten_HTML.r')

####################################################
############ Library declarations
## Plotting libraries
libraryRequireInstall("ggplot2")

libraryRequireInstall("plotly")

libraryRequireInstall("ggplotly")

libraryRequireInstall("gapminder")

libraryRequireInstall("gsubfn")
## Datastream parsing library
libraryRequireInstall("magrittr")

## HTML function and output facilitator libraries
libraryRequireInstall("htmlwidgets")

libraryRequireInstall("XML")



####################################################

disabledButtonsList <- list('toImage', 'sendDataToCloud')
errorText <- NULL
####### Data validation
ReadFullFileReplaceString <- function(fnameIn, fnameOut, sourceString,targetString)
{
  if(!file.exists(fnameIn))
    return(NULL)
  
  tx  <- readLines(fnameIn)
  tx2  <- gsub(pattern = sourceString, replace = targetString, x = tx)
  writeLines(tx2, con = fnameOut)
}
modify_measuretext <- function(text_measure)
{
  var_text1 <- text_measure
    text_tool1 <- substr(var_text1,1,20)
    if(nchar(text_measure)< 20) 
    {
      finaltext_measure1 <- text_tool1
    } else {
    finaltext_measure1 <- paste(text_tool1,"...")
    }
    return (finaltext_measure1)
}
###### Check if essential fields are given
if ((!exists("Category")) || (!exists("Value")))
{
  xlayout <- list(
    title = "Please provide with the category and at least one measure",
    zeroline = FALSE,
    showline = FALSE,
    showticklabels = FALSE,
    showgrid = FALSE
  )
  ylayout <- list(
    title = "",
    zeroline = FALSE,
    showline = FALSE,
    showticklabels = FALSE,
    showgrid = FALSE
  )
  plotOutput <- plot_ly() %>% 
  layout(title = '',
         xaxis = xlayout,
         yaxis = ylayout)
  plotOutput$x$config$modeBarButtonsToRemove = disabledButtonsList
    
    ##Render the plot in power bi visual window
    internalSaveWidget(config(
      plotOutput,
      collaborate = FALSE,
      displaylogo = FALSE
    ),
    'out.html')
  
  quit()
}
### Initiate error handling
tryCatch({
  ##### Converting user data to data frames
  sourceData <- data.frame(Category, Value)
  userDataColNames <- colnames(sourceData)
  userDataColNames <- gsub(".", " ", userDataColNames, fixed = TRUE)
  numberofValues <- ncol(Value)
  
  ##### Initializing default properties
  lineSegmentColor <- "#5F6B6D"
  
  lineSegment2Color <- "#8AD4EB"
  
  lineSegment3Color <- "#374649"
  
  value1Color <- "#01B8AA"
  
  value2Color <- "#FD625E"
  
  value3Color <- "#A66999"
  
  value4Color <- "#F2C80F"
  
  yColor <- "grey"
  
  xColor <- "grey"
  
  ytextColor <- "black"
  
  xtextColor <- "black"
  
  chartColor <- "white"
  
  plotColor <- "white"
  
  leftMargin <- 80
  
  xtick <- TRUE
  
  ytick <- TRUE

  legend <- TRUE
  
  
  ####### Check for user definition of properties and asign them to their respective variables
  if (exists("legend_show")) {
    legend <- legend_show
  }
  if (exists("visualColors_segmentColor")) {
    lineSegmentColor <- visualColors_segmentColor
  }
  if (exists("visualColors_segment2Color")) {
    lineSegment2Color <- visualColors_segment2Color
  }
  if (exists("visualColors_segment3Color")) {
    lineSegment3Color <- visualColors_segment3Color
  }
  if (exists("yAxis_labelColor")) {
    ytextColor <- yAxis_labelColor
  }
  if (exists("xAxis_labelColor")) {
    xtextColor <- xAxis_labelColor
  }
  if (exists("visualColors_valueColor1")) {
    value1Color <- visualColors_valueColor1
  }
  if (exists("visualColors_valueColor2")) {
    value2Color <- visualColors_valueColor2
  }
  if (exists("visualColors_valueColor3")) {
    value3Color <- visualColors_valueColor3
  }
  if (exists("visualColors_valueColor4")) {
    value4Color <- visualColors_valueColor4
  }
  if (exists("yAxis_titleColor")) {
    yColor <- yAxis_titleColor
  }
  if (exists("xAxis_titleColor")) {
    xColor <- xAxis_titleColor
  }
  if (exists("visualColors_lMargin")) {
    leftMargin <- visualColors_lMargin
  }
  if (exists("visualColors_plotColor")) {
    plotColor <- visualColors_plotColor
  }
  if (exists("visualColors_chartColor")) {
    chartColor <- visualColors_chartColor
  }
  if (exists("xAxis_showLabel")) {
    xtick <- xAxis_showLabel
  }
  if (exists("yAxis_showLabel")) {
    ytick <- yAxis_showLabel
  }
  ### Creating stylings for axis text
  
  titlefontx <- list(family = "Arial, sans-serif",
                     size = 18,
                     color = xColor)
  titlefonty <- list(family = "Arial, sans-serif",
                     size = 18,
                     color = yColor)
  tickfonty <- list(family = "Old Standard TT, serif",
                    size = 14,
                    color = ytextColor)
  tickfontx <- list(family = "Old Standard TT, serif",
                    size = 14,
                    color = xtextColor)
  
  ## declaring constants
  marginLeftVal <- 100
  marginRightVal <- 0
  marginTopVal <- 0
  marginBottomVal <- 50
  
  #### Initiating plot for 4 measures
  
  if (numberofValues == 4) {
    yLegend <- sprintf("%s", userDataColNames[1])
    
    xLegend <-
      sprintf(
        "Difference between %s, %s, %s and %s",
        userDataColNames[2],
        userDataColNames[3],
        userDataColNames[4],
        userDataColNames[5]
      )
    
    
    if (exists("yAxis_titleText")) {
      yLegend <- yAxis_titleText
    }
    if (exists("xAxis_titleText")) {
      xLegend <- xAxis_titleText
    }
    
     ##code for ellipses for 4 measures
    text1 <- userDataColNames[2]
    text_fi1 <- modify_measuretext(text1)
    #2nd measure
    text2 <- userDataColNames[3]
    text_fi2 <- modify_measuretext(text2)
    #3rd measure
    text3 <- userDataColNames[4]
    text_fi3 <- modify_measuretext(text3)
    #4th measure
    text4 <- userDataColNames[5]
    text_fi4 <- modify_measuretext(text4)
    colnames(sourceData) <-
      c("Category", "Value1", "Value2", "Value3", "Value4")
    sourceData$Category <-
      factor(sourceData$Category, levels = sourceData$Category[order(sourceData$Value3)])
    
    plotOutput <- plot_ly(sourceData) %>%
      ##Add segments
      add_segments(
        x = ~ Value1,
        xend = ~ Value2,
        y = ~ Category,
        yend = ~ Category,
        showlegend = FALSE,
        color = I(lineSegmentColor)
      ) %>%
      add_segments(
        x = ~ Value2,
        xend = ~ Value3,
        y = ~ Category,
        yend = ~ Category,
        showlegend = FALSE,
        color = I(lineSegment2Color)
      ) %>%
      add_segments(
        x = ~ Value3,
        xend = ~ Value4,
        y = ~ Category,
        yend = ~ Category,
        showlegend = FALSE,
        color = I(lineSegment3Color)
      ) %>%
      ##Add markers for value 1
      add_markers(
        x = ~ Value1,
        y = ~ Category,
        name = modify_measuretext(userDataColNames[2]),
        color = I(value1Color),
        text = ~ paste(Value1, '<br>', Category, '<br>', text_fi1),
        type = 'scatter',
        mode = 'markers',
        showlegend = legend,
        hoverinfo = "text"
      ) %>%
      ##Add markers for value 2
      add_markers(
        x = ~ Value2,
        y = ~ Category,
        name = modify_measuretext(userDataColNames[3]),
        color = I(value2Color),
        text = ~ paste(Value2, '<br>', Category, '<br>', text_fi2),
        type = 'scatter',
        mode = 'markers',
        showlegend = legend,
        hoverinfo = "text"
      ) %>%
      ##Add markers for value 3
      add_markers(
        x = ~ Value3,
        y = ~ Category,
        name = modify_measuretext(userDataColNames[4]),
        color = I(value3Color),
        text = ~ paste(Value3, '<br>', Category, '<br>', text_fi3),
        type = 'scatter',
        mode = 'markers',
        showlegend = legend,
        hoverinfo = "text"
      ) %>%
      ##Add markers for value 4
      add_markers(
        x = ~ Value4,
        y = ~ Category,
        name = modify_measuretext(userDataColNames[5]),
        color = I(value4Color),
        text = ~ paste(Value4, '<br>', Category, '<br>', text_fi4),
        type = 'scatter',
        mode = 'markers',
        showlegend = legend,
        hoverinfo = "text"
      ) %>%
      layout(
        xaxis = list(
          title = xLegend,
          titlefont = titlefontx,
          showticklabels = xtick,
          tickfont = tickfontx
        ),
        yaxis = list(
          title = yLegend,
          titlefont = titlefonty,
          showticklabels = ytick,
          tickfont = tickfonty
        ),
        margin = list(
          l = marginLeftVal,
          r = marginRightVal,
          t = marginTopVal,
          b = marginBottomVal
        ),
        plot_bgcolor = chartColor,
        paper_bgcolor = plotColor
      )
    plotOutput$x$config$modeBarButtonsToRemove = disabledButtonsList
    
    ##Render the plot in power bi visual window
    internalSaveWidget(config(
      plotOutput,
      collaborate = FALSE,
      displaylogo = FALSE
    ),
    'out.html')
    
  }
  
  
  ####Initiating plot for 3 measures
  if (numberofValues == 3) {
    
    yLegend <- sprintf("%s", userDataColNames[1])
    
    xLegend <-
      sprintf(
        "Difference between %s, %s and %s",
        userDataColNames[2],
        userDataColNames[3],
        userDataColNames[4]
      )
    
    
    if (exists("yAxis_titleText")) {
      yLegend <- yAxis_titleText
    }
    if (exists("xAxis_titleText")) {
      xLegend <- xAxis_titleText
    }
     ##code for ellipses for 3 measures
    text1 <- userDataColNames[2]
    text_fi1 <- modify_measuretext(text1)
    #2nd measure
    text2 <- userDataColNames[3]
    text_fi2 <- modify_measuretext(text2)
    #3rd measure
    text3 <- userDataColNames[4]
    text_fi3 <- modify_measuretext(text3)
    colnames(sourceData) <-
      c("Category", "Value1", "Value2", "Value3")
    sourceData$Category <-
      factor(sourceData$Category, levels = sourceData$Category[order(sourceData$Value3)])
    
    plotOutput <- plot_ly(sourceData) %>%
      ##Add segments
      add_segments(
        x = ~ Value1,
        xend = ~ Value2,
        y = ~ Category,
        yend = ~ Category,
        showlegend = FALSE,
        color = I(lineSegmentColor)
      ) %>%
      add_segments(
        x = ~ Value2,
        xend = ~ Value3,
        y = ~ Category,
        yend = ~ Category,
        showlegend = FALSE,
        color = I(lineSegment2Color)
      ) %>%
      ##Add markers for value 1
      add_markers(
        x = ~ Value1,
        y = ~ Category,
        name = modify_measuretext(userDataColNames[2]),
        color = I(value1Color),
        text = ~ paste(Value1, '<br>', Category, '<br>', text_fi1),
        type = 'scatter',
        mode = 'markers',
        showlegend = legend,
        hoverinfo = "text"
      ) %>%
      ##Add markers for value 2
      add_markers(
        x = ~ Value2,
        y = ~ Category,
        name = modify_measuretext(userDataColNames[3]),
        color = I(value2Color),
        text = ~ paste(Value2, '<br>', Category, '<br>', text_fi2),
        type = 'scatter',
        mode = 'markers',
        showlegend = legend,
        hoverinfo = "text"
      ) %>%
      ##Add markers for value 3
      add_markers(
        x = ~ Value3,
        y = ~ Category,
        name = modify_measuretext(userDataColNames[4]),
        color = I(value3Color),
        text = ~ paste(Value3, '<br>', Category, '<br>', text_fi3),
        type = 'scatter',
        mode = 'markers',
        showlegend = legend,
        hoverinfo = "text"
      ) %>%
      layout(
        xaxis = list(
          title = xLegend,
          titlefont = titlefontx,
          showticklabels = xtick,
          tickfont = tickfontx
        ),
        yaxis = list(
          title = yLegend,
          titlefont = titlefonty,
          showticklabels = ytick,
          tickfont = tickfonty
        ),
        margin = list(
          l = marginLeftVal,
          r = marginRightVal,
          t = marginTopVal,
          b = marginBottomVal
        ),
        plot_bgcolor = chartColor,
        paper_bgcolor = plotColor
      )
    
    plotOutput$x$config$modeBarButtonsToRemove = disabledButtonsList
    ##Render the plot in power bi visual window
    internalSaveWidget(config(
      plotOutput,
      collaborate = FALSE,
      displaylogo = FALSE
    ),
    'out.html')
    
  }
  
  ####Initiating plot for 2 measures
  if (numberofValues == 2) {
    yLegend <- sprintf("%s", userDataColNames[1])
    
    xLegend <-
      sprintf("Difference between %s and %s",
              userDataColNames[2],
              userDataColNames[3])
    
    
    if (exists("yAxis_titleText")) {
      yLegend <- yAxis_titleText
    }
    if (exists("xAxis_titleText")) {
      xLegend <- xAxis_titleText
    }
    ##code for ellipses for 2 measures
    text1 <- userDataColNames[2]
    text_fi1 <- modify_measuretext(text1)
    #2nd measure
    text2 <- userDataColNames[3]
    text_fi2 <- modify_measuretext(text2)

    colnames(sourceData) <- c("Category", "Value1", "Value2")
    sourceData$Category <-
      factor(sourceData$Category, levels = sourceData$Category[order(sourceData$Category)])
    sd <- ~ Value1
     sizevw <- dev.size("px")
      if(sizevw < 500) {
        showlegend: FALSE
      }
    plotOutput <- plot_ly(sourceData) %>%
      ##Add segments
      add_segments(
        x = ~ Value1,
        xend = ~ Value2,
        y = ~ Category,
        yend = ~ Category,
        showlegend = FALSE,
        color = I(lineSegmentColor)
      ) %>%
      ##Add markers for value 1
      add_markers(
        x = ~ Value1,
        y = ~ Category,
        name = modify_measuretext(userDataColNames[2]),
        color = I(value1Color),
        text = ~ paste(Value1, '<br>', Category, '<br>', text_fi1),
        type = 'scatter',
        mode = 'markers',
        showlegend = legend,
        hoverinfo = "text"
      ) %>%
      ##Add markers for value 2
      add_markers(
        x = ~ Value2,
        y = ~ Category,
        name = modify_measuretext(userDataColNames[3]),
        color = I(value2Color),
        text = ~ paste(Value2, '<br>', Category, '<br>', text_fi2),
        type = 'scatter',
        mode = 'markers',
        showlegend = legend,
        hoverinfo = "text"
      ) %>%
     
      layout(
        xaxis = list(
          title = xLegend,
          titlefont = titlefontx,
          showticklabels = xtick,
          tickfont = tickfontx
        ),
        yaxis = list(
          title = yLegend,
          titlefont = titlefonty,
          showticklabels = ytick,
          tickfont = tickfonty
        ),
        margin = list(
          l = marginLeftVal,
          r = marginRightVal,
          t = marginTopVal,
          b = marginBottomVal
        ),
        plot_bgcolor = chartColor,
        paper_bgcolor = plotColor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
      )
    
    plotOutput$x$config$modeBarButtonsToRemove = disabledButtonsList
    ##Render the plot in power bi visual window
    internalSaveWidget(config(
      plotOutput,
      collaborate = FALSE,
      displaylogo = FALSE
    ),
    'out.html')
    
  }
  
  ####Initiating plot for 1 measure
  if (numberofValues == 1) {
    yLegend <- sprintf("%s", userDataColNames[1])
    
    xLegend <- sprintf("%s", userDataColNames[2])
    
    
    if (exists("yAxis_titleText")) {
      yLegend <- yAxis_titleText
    }
    if (exists("xAxis_titleText")) {
      xLegend <- xAxis_titleText
    }
     #1st measure
    text2 <- userDataColNames[2]
    text_fi2 <- modify_measuretext(text2)
    colnames(sourceData) <- c("Category", "Value1")
    sourceData$Category <-
      factor(sourceData$Category, levels = sourceData$Category[order(sourceData$Value1)])
    
    plotOutput <-
      plot_ly(sourceData, color = I(lineSegmentColor)) %>%
      ##Add markers
      add_markers(
        x = ~ Value1,
        y = ~ Category,
        name = modify_measuretext(userDataColNames[2]),
        color = I(value1Color),
        text = ~ paste(Value1, '<br>', Category, '<br>', text_fi2),
        type = 'scatter',
        mode = 'markers',
        showlegend = legend,
        hoverinfo = "text"
      ) %>%
      
      layout(
        xaxis = list(
          title = xLegend,
          titlefont = titlefontx,
          showticklabels = xtick,
          tickfont = tickfontx
        ),
        yaxis = list(
          title = yLegend,
          titlefont = titlefonty,
          showticklabels = ytick,
          tickfont = tickfonty
        ),
        margin = list(
          l = marginLeftVal,
          r = marginRightVal,
          t = marginTopVal,
          b = marginBottomVal
        ),
        plot_bgcolor = chartColor,
        paper_bgcolor = plotColor
      )
    
    plotOutput$x$config$modeBarButtonsToRemove = disabledButtonsList
    ##Render the plot in power bi visual window
    internalSaveWidget(config(
      plotOutput,
      collaborate = FALSE,
      displaylogo = FALSE
    ),
    'out.html')
    
  }
},

#######Handle error and display message
error = function(e) {
  xlayout <- list(
    title = sprintf("Error:%s: Please build the model again using suitable values", e),
    zeroline = FALSE,
    showline = FALSE,
    showticklabels = FALSE,
    showgrid = FALSE
  )
  ylayout <- list(
    title = "",
    zeroline = FALSE,
    showline = FALSE,
    showticklabels = FALSE,
    showgrid = FALSE
  )
  plotOutput <- plot_ly() %>%
    layout(title = '',
           xaxis = xlayout,
           yaxis = ylayout)
  
  plotOutput$x$config$modeBarButtonsToRemove = disabledButtonsList
  internalSaveWidget(plotOutput, 'out.html')
  
  quit()
  
})
ReadFullFileReplaceString('out.html', 'out.html', ',"padding":40,', ',"padding":0,')