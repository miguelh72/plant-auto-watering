#include "EventQueue.h"

LinkedList<EventListItem *> *EventQueue::_events = new LinkedList<EventListItem *>();

void EventQueue::on(char *eventName, void (*callback)(void *payload))
{
  // Find EventQueueItem with matching eventName, if it exists
  for (int i = 0; i < EventQueue::_events->size(); i++)
  {
    EventListItem *node = EventQueue::_events->get(i);
    if (String(node->name).compareTo(eventName) == 0)
    {
      // If it exists, Push callback
      node->subscribers->add(callback);
      return;
    }
  }

  // Else, create a new new with that event name and a new list with the callback
  LinkedList<void (*)(void *payload)> *newSubscriberList = new LinkedList<void (*)(void *payload)>();
  newSubscriberList->add(callback);

  EventListItem *newNode = new EventListItem();
  newNode->name = eventName;
  newNode->subscribers = newSubscriberList;

  EventQueue::_events->add(newNode);
}

/**
 * Note: this will not cleanup memory for callback or the eventName
 */
bool EventQueue::remove(char *eventName, void (*callback)(void *payload))
{
  // Find EventQueueItem with matching eventName, if it exists
  for (int i = 0; i < EventQueue::_events->size(); i++)
  {
    EventListItem *node = EventQueue::_events->get(i);
    if (String(node->name).compareTo(eventName) == 0)
    {
      // If it exists, search for matching function
      for (int j = 0; j < node->subscribers->size(); j++)
      {
        if (node->subscribers->get(j) == callback)
        {
          node->subscribers->remove(j);
          return true;
        }
      }

      // If it matched eventName but didn't have the function in it's subscribers, we are done searching
      break;
    }
  }

  return false;
}

void EventQueue::printEvents()
{
  Serial.println("START EVENT LIST");

  for (int i = 0; i < EventQueue::_events->size(); i++)
  {
    EventListItem *node = EventQueue::_events->get(i);
    char *name = node->name;
    int numSubscribers = node->subscribers->size();

    Serial.println(String(">> Event name: ") + String(name));
    Serial.println(String(">> Num. subscribers: ") + String(numSubscribers));
  }

  Serial.println("END EVENT LIST");
}
