#include "EventQueue.h"

LinkedList<EventListItem *> *EventQueue::events = new LinkedList<EventListItem *>();

void EventQueue::on(char *eventName, void (*callback)(void *payload))
{
  /*
  Serial.println("Hello World " + eventName);

  char *empty = "BAM!";
  callback((void *)empty);
  */

  // Find EventQueueItem with matching eventName, if it exists
  for (int i = 0; i < EventQueue::events->GetSize(); i++)
  {
    EventListItem *node = EventQueue::events->GetAt(i);
    if (String(node->name).compareTo(eventName) == 0)
    {
      // If it exists, Push callback
      return node->subscribers->InsertTail(callback);
    }
  }

  // Else, create a new new with that event name and a new list with the callback
  LinkedList<void (*)(void *payload)> *newSubscriberList = new LinkedList<void (*)(void *payload)>();
  newSubscriberList->InsertHead(callback);

  EventListItem *newNode = new EventListItem();
  newNode->name = eventName;
  newNode->subscribers = newSubscriberList;

  EventQueue::events->InsertHead(newNode);
}

void EventQueue::printEvents()
{
  Serial.println("START EVENT LIST");

  for (int i = 0; i < EventQueue::events->GetSize(); i++)
  {
    EventListItem *node = EventQueue::events->GetAt(i);
    char *name = node->name;
    int numSubscribers = node->subscribers->GetSize();

    Serial.println(String(">> Event name: ") + String(name));
    Serial.println(String(">> Num. subscribers: ") + String(numSubscribers));
  }

  Serial.println("END EVENT LIST");
}
