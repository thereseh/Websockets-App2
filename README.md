# Particle Web Matrix

https://damp-depths-47377.herokuapp.com/

Multi-user app that's handling collision and physics on the server.
This is a project that I created in class. We had to develop a multi-user app handling physics/collision in near-real time, either server side or via a client host.

I wanted to create an abstract experience, rather than a game, so I started to play around with the idea of particles. I found some cool web matrix examples online and wanted to make something similar.

I have a physics file that get information from socket.io (such as who clicked, and where on the screen), and takes that to create instances of a circle class. The physics file also keeps calculating new positions of these circles, the distances between them (such as, should a line be created between two circles or are the circles colliding). The physics file has an array of circles, all lines drawn between them, and particles created after collision. These arrays are constantly being sent back to the clients with socket.io, so the calculations only needs to be done once.

The user has the option to change their color and name, and when they do, socket.io will send the information to the server, so the server can tell all other clients to update their information about the user, since the canvas rendering is happening client side.

The canvas style however, is for the client only. It's just for personal preference.
