#include "Arduino.h"

// https://github.com/ivanseidel/LinkedList
#include "LinkedList.h"

#include "Timeout.h"

LinkedList<TimeoutQueueItem *> *Timeout::_queue = new LinkedList<TimeoutQueueItem *>();

int nextTimeoutID = 0;

int Timeout::setTimeout(void (*callback)(), int ms)
{
  int timeoutID = nextTimeoutID++;

  TimeoutQueueItem *timeoutQueueItem = new TimeoutQueueItem();
  timeoutQueueItem->timeoutID = timeoutID;
  timeoutQueueItem->callback = callback;
  timeoutQueueItem->expiresAt = millis() + (unsigned long)ms;

  Timeout::_queue->add(timeoutQueueItem);

  return timeoutID;
}

bool Timeout::clearTimeout(int timeoutID)
{
  for (int i = 0; i < Timeout::_queue->size(); i++)
  {

    TimeoutQueueItem *timeoutQueueItem = Timeout::_queue->get(i);
    if (timeoutQueueItem->timeoutID == timeoutID)
    {
      Timeout::_queue->remove(i);
      delete timeoutQueueItem;

      return true;
    }
  }

  return false;
}

void Timeout::handleExpiredCallbacks()
{
  unsigned long currentTime = millis();

  for (int i = Timeout::_queue->size() - 1; i >= 0; i--)
  {
    // Looping backwards so shifting of indicies due to removing element won't
    // affect index of subsequent elements I will look at
    TimeoutQueueItem *timeoutQueueItem = Timeout::_queue->get(i);
    if (timeoutQueueItem->expiresAt <= currentTime)
    {
      timeoutQueueItem->callback();

      Timeout::_queue->remove(i);
      delete timeoutQueueItem;
    }
  }
}
