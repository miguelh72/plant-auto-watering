// https://github.com/ivanseidel/LinkedList
#include "LinkedList.h"

struct TimeoutQueueItem
{
  int timeoutID;
  unsigned long expiresAt;
  void (*callback)();
};

class Timeout
{
public:
  static LinkedList<TimeoutQueueItem *> *_queue;

  static int setTimeout(void (*callback)(), int ms);
  static bool clearTimeout(int timeoutID);
  static void handleExpiredCallbacks();

protected:
private:
};

#define setTimeout(callback, ms) Timeout::setTimeout(callback, ms)
#define clearTimeout(timeoutID) Timeout::clearTimeout(timeoutID)
