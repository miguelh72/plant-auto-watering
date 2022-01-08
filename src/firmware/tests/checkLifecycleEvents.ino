
#include "LifecycleEvents.h"

void once() // required by LifecycleEvents system
{
  EventQueue::on("serial_connected", &printSerial);
}

void printSerial(void *payload)
{
  Serial.println("Serial");
  EventQueue::on("loop", &printLoop);
}

int times = 0;

void printLoop(void *payload)
{
  times++;

  if (times % 10000 == 0)
  {
    times = 0;
    Serial.println("Loop");
  }
}
