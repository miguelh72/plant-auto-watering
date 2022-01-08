#include "EventQueue.h"
#include "Timeout.h"

void setupBody()
{
  once();
  EventQueue::on("loop_end", (void (*)(void *)) & Timeout::handleExpiredCallbacks);
}

// Optionally use BAUD_RATE directive to set a specific baud rate for serial communication.
#ifdef BAUD_RATE
void setup()
{
  setupBody();
  Serial.begin(BAUD_RATE);
}
#endif
#ifndef BAUD_RATE
void setup()
{
  setupBody();
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

  // Use for functions that must run after any loop event listeners
  EventQueue::emit("loop_end", nullptr);

  EventQueue::handleEvents();
}
