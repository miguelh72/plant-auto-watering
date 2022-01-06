#include "LinkedListLib.h"

/*
Plug you arduino board,
upload the code,
run monitor ( ctrl+shift+M )
*/
void setup()
{
  Serial.begin(9600);
}

void loop()
{
  Serial.println("Hello World\0");
  delay(1000);
}
