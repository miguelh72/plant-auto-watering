#ifndef EventQueue_h
#define EventQueue_h

// https://github.com/luisllamasbinaburo/Arduino-LinkedList
#include "LinkedListLib.h"

struct EventQueueItem
{
  String name;
  void *payload; // Can be cast to any foo*
};

// typedef void ListenerFunction(void *payload); // try with or without the * in front of ListenerFunction

struct EventListItem
{
  String name;
  LinkedList<void (*)(void *payload)> subscribers;
};

class EventQueue
{
public:
  static void on(String eventName, void (*callback)(void *payload));
  // static void remove(String eventName, void (*callback)(void *payload));
  // static void emit(String eventName, void *payload);
  // static void handleEvents();

protected:
private:
  LinkedList<EventQueueItem> queue;
  LinkedList<EventListItem> events;
};

#endif