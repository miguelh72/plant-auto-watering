#include "EventQueue.h"

LinkedList<EventListItem *> *EventQueue::_events = new LinkedList<EventListItem *>();
LinkedList<EventQueueItem *> *EventQueue::_queue = new LinkedList<EventQueueItem *>();

void EventQueue::on(char *eventName, void (*callback)(void *payload))
{
  // Find EventListItem with matching eventName, if it exists
  for (int i = 0; i < EventQueue::_events->size(); i++)
  {
    EventListItem *node = EventQueue::_events->get(i);

    if (node->name == eventName)
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
  // Find EventListItem with matching eventName, if it exists
  for (int i = 0; i < EventQueue::_events->size(); i++)
  {
    EventListItem *node = EventQueue::_events->get(i);

    if (node->name == eventName)
    {
      // If it exists, search for matching function
      for (int j = 0; j < node->subscribers->size(); j++)
      {
        if (node->subscribers->get(j) == callback)
        {
          node->subscribers->remove(j);
          // TODO remove EventListItem if there are no subscribers left
          return true;
        }
      }

      // If it matched eventName but didn't have the function in it's subscribers, we are done searching
      break;
    }
  }

  return false;
}

void EventQueue::emit(char *eventName, void *payload)
{
  EventQueueItem *node = new EventQueueItem();
  node->name = eventName;
  node->payload = payload;

  // Push event to queue
  EventQueue::_queue->add(node);
}

/**
 * Add this function call to end of loop function.
 */
void EventQueue::handleEvents()
{
  if (EventQueue::_queue->size() == 0)
  {
    return;
  }

  // Handle only the current number of events in case any callback generate new events,
  // which should wait until the next loop cycle
  const int currentNumOfEvents = EventQueue::_queue->size();
  for (int i = 0; i < currentNumOfEvents; i++)
  {
    EventQueueItem *eventItem = EventQueue::_queue->shift();

    // Find EventListItem with matching eventName, if it exists
    for (int i = 0; i < EventQueue::_events->size(); i++)
    {
      EventListItem *node = EventQueue::_events->get(i);

      if (node->name == eventItem->name)
      {
        // If it exists, call all callbacks with payload
        for (int j = 0; j < node->subscribers->size(); j++)
        {
          void (*callback)(void *payload) = node->subscribers->get(j);
          callback(eventItem->payload);
        }
      }
    }

    delete eventItem;
  }
}
