
# For simplicity, I'm assuming Raylib is installed to the system

# There should be libraylib.a in /usr/local/lib
#    you should generate this file for your own
#    system: https://github.com/raysan5/raylib/wiki/
#    (see Development Platforms)
# There should be raylib.h in /usr/local/include
#    you can copy the include folder

default: mac

# Debian / Ubuntu
linux:
	gcc main.c -o game -lraylib -lGL -lm -lpthread -ldl -lrt -lX11

# Raspberry PI
rpi:
	gcc main.c -o game -lraylib -lGL -lm -lpthread -ldl -lrt -lX11 -latomic

# Mac OS
mac:
	clang -framework CoreVideo -framework IOKit -framework Cocoa -framework GLUT -framework OpenGL -lraylib main.c -o game 

# Create a cross-platform browser build
#     This requires emscripten to be installed
#     https://emscripten.org/docs/getting_started/downloads.html
web:
