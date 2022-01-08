
#include "EventQueue.h"

// Optionally use BAUD_RATE directive to set a specific baud rate for serial communication.
#ifdef BAUD_RATE
void setup()
{
  once();
  Serial.begin(BAUD_RATE);
}
#endif
#ifndef BAUD_RATE
void setup()
{
  once();
  Serial.begin(115200);
}
#endif

bool hasConnectedSerial = false;

void loop()
{
  // Emit loop event
  EventQueue::emit("loop", nullptr);

  // Check Serial and emit event if it becomes available
  if (!hasConnectedSerial && Serial)
  {
    hasConnectedSerial = true;
    EventQueue::emit("serial_connected", nullptr);
  }

  EventQueue::handleEvents();
}

void printSerial(void *payload)
{
  Serial.println("Serial");
  EventQueue::on("loop", &printLoop);
}

int times = 0;

void printLoop(void *payload)
{
  // Serial.println(times);

  times++;

  if (times % 10000 == 0)
  {
    times = 0;
    Serial.println("Loop");
  }
}

void once()
{
  EventQueue::on("serial_connected", &printSerial);
}
