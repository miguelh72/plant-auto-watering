#ifndef EventQueue_h
#define EventQueue_h

// https://github.com/luisllamasbinaburo/Arduino-LinkedList
#include "LinkedListLib.h"

struct EventQueueItem
{
  char *name;
  void *payload; // Can be cast to any foo*
};

// typedef void ListenerFunction(void *payload); // try with or without the * in front of ListenerFunction

struct EventListItem
{
  char *name;
  LinkedList<void (*)(void *payload)> *subscribers;
};

class EventQueue
{
public:
  static void on(char *eventName, void (*callback)(void *payload));
  // static void remove(String eventName, void (*callback)(void *payload));
  // static void emit(String eventName, void *payload);
  // static void handleEvents();
  static void printEvents();

protected:
private:
  static LinkedList<EventQueueItem *> *queue;
  static LinkedList<EventListItem *> *events;
};

#endif