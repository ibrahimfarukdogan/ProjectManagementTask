This project made by Ibrahim Faruk Dogan for Job Test

At backend I used nodejs express environment and vscode. For frontend React ts library and I used vscode

For running the project you need the nodejs, also you need to open the folder named "frontend" with vscode, after that open terminal and write "npm install" while at frontend folder. 

For backend you need to open the folder named "backend" with vscode, after that open terminal and write "npm install" while at frontend folder.

After that go back to parent folder with docker-compose on and write docker-compose up --build (if it doesn't work you may need virtualization and docker environment to be open and installed)

But you need to add values for frontend work. So for this you copy "backup.tar" file from "backup" folder and open DBeaver, connect it to postgresql using docker-compose's postgresql url, it's order are= host://name:password@db:portnumber. After conencted and when you see mydb, you right click it and from the menu you click: Tools->Restore and select the Format as "Tar" then select Backup.tar from the list, if it's not seen, then you need to check file extensions on the choose file screen and rather than "*.backup", choose "* (*)". Then you start restoration. After that you can go to your frontend url for home page at your browser to see the UI.

Lastly When it comes to using the website, you can navigate after you logged on, for admins there is a navbar with 3 lines at the top left that opens a sidebar with selectable urls. User doesn't have it because they have home page and from there they can only go to details with clicking a project's detail button. Also admins can create users/projects/tasks with the "create" button at the top under the navbar in each of the respective pages
