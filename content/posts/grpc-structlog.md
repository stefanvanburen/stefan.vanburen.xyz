---
title: "gRPC and structlog in Python"
date: 2019-06-04T20:48:11-04:00
draft: true
---

[`structlog`](https://github.com/hynek/structlog) is a fantastic Python library for structured logging. One of it's best features, for the sake of request based applications, is threadlocal storage. This allows for per-request variables to be bound to a logger that is local to the request, which further enhances debugging.

I generally find that when paired with gRPC, the best method is a per-RPC decorator that deals with setting up the logging, amongst other things. I'd also imagine that the new-fangled interceptors could serve a similar function.

```python
# wrapper.py

import uuid
from structlog import get_logger

logger = get_logger()

def rpc_wrapper(rpc):
    log = logger.bind({"request-id": uuid.uuid4()})
    pass
```

```python
# service.py
from service_pb2 import ABCService
from wrapper import rpc_wrapper
from structlog import get_logger

logger = get_logger()


class Service(ABCService):

    @rpc_wrapper
    def DoRPC():
        logger.info("hello!")
```
