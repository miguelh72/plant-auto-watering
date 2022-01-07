#include "LinkedListLib.h"
#include "UnitTest.h"

#include "EventQueue.h"

void printArray(int *x, int length)
{
  for (int iCount = 0; iCount < length; iCount++)
  {
    Serial.print(x[iCount]);
    Serial.print(',');
  }
  Serial.println("");
}

struct Test
{
  char *value;
};

void test(void *payload)
{
  char *pl = (char *)payload;

  Serial.println("called inner func");
  Serial.println("Payload " + String(pl));
};

void setup()
{
  Serial.begin(9600);
  while (!Serial)
  {
    ; // wait for serial port to connect. Needed for native USB
  }

  EventQueue::on("TestEventName", &test);

  EventQueue::printEvents();

  /*
    // How to pass struct by reference
    Test *t;
    t->value = "Hello Struct pointer passing";
    Serial.println(t->value);

    void *p = t;

    Test *t2 = (Test *)p;

    Serial.println(t2->value);
    */
}

void loop()
{

  delay(1000);
}
