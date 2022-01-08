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
