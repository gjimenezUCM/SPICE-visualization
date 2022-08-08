# SPICE-visualization

Online deployment: https://gjimenezucm.github.io/SPICE-visualization/


## How to download and launch the project localy

1- Download the project:
<br> [Last stable update.](https://codeload.github.com/gjimenezUCM/SPICE-visualization/zip/refs/heads/main)
<br> [Last update.](https://codeload.github.com/gjimenezUCM/SPICE-visualization/zip/refs/heads/develop) 

2- Open the project folder with powershell.

3- Install all packages.
<br>```npm i```

4- Launch a webpack server localy.
<br>```npm run server```

5- Open the aplication in a search engine in the following adress.
<br>```http://localhost:1234/dist/```

## How to use and available options

The application has several diferent options located in the toolbar at the top.

- File Source dropdown: It lets u pick where to pick the perspective files. Main/develop download them from this repository branches. Local use your local files. Use the api currently does nothing.

- Layout: It lets u change the layout of networks when 2 or more networks are shown at the same time. **Dont activate two perspectives of diferent museums/origins or some parts of the application will fail.**

- Options: It lets u change some generic options of the networks. 
  - Hide node labels: Hide all node labels and ids and change their display text to some dummy text created randomly.
  - Hide unselected Edges: Hide all edges except when u select a node, all edges conected to that node wont be hidden while the node is selected.
  - Minimum Similarity: Hide all edges that have less similarity than the value.
  - Variable edge width: Change the width of all edges to be related with its similarity value. The more similarity, the wider.
  - Third dimension: Update the node visualization dimensions to add a third one. If the perspective has a third explicit community, the network will use it to change node border color depending on this third explicit community value.
 
- Select Perspective: It lets u activate/disactive diferent perspectives. **Dont activate two perspectives of diferent museums/origins or some parts of the application will fail.**

- Legend: It lets u see the legend of the current shown perspectives and also filter/toggle nodes clicking the legend options.

## Add new files to local environement

Currently the project use local json files or this repository main/develop branches as the data source of the networks.
To test new data u need:

1- To add the json file to /data/ folder. Be aware that it must follow the format of a perspective, otherwise the app wont handle it.

2- Update the /data/dataList.json to include the name of the new perspective. 

3- Update/reload the web page so the application reconize the changes.

4- Make sure to select Local as the file source.
