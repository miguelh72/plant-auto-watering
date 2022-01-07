#ifndef EventQueue_h
#define EventQueue_h

// https://github.com/ivanseidel/LinkedList
#include "LinkedList.h"

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
  // Had to expose these for testing purposes, should be private
  static LinkedList<EventQueueItem *> *_queue;
  static LinkedList<EventListItem *> *_events;

  static void on(char *eventName, void (*callback)(void *payload));
  static bool remove(char *eventName, void (*callback)(void *payload));
  static void emit(char *eventName, void *payload);
  // static void handleEvents();
  static void printEvents();

protected:
private:
};

#endif