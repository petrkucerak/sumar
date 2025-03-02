CC = gcc
CFLAGS = -Wall -Wextra -std=c11
SRC = main.c
OBJ = build/$(SRC:.c=.o)
TARGET = build/program

all: build_dir $(TARGET)

build_dir:
	mkdir -p build

$(TARGET): $(OBJ)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJ)

build/%.o: %.c | build_dir
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -rf build

.PHONY: all clean build_dir
