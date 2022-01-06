#include "EventQueue.h"

void EventQueue::on(String eventName, void (*callback)(void *payload))
{
  Serial.println("Hello World " + eventName);

  char *empty = "BAM!";
  callback((void *)empty);
}
