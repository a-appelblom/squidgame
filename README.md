# squidgame

To install dependencies:

```bash
bun install
```

Bun should be the only dependency though

To run:

```bash
bun run main.ts
```

## A note on performance

I recognise that this is not the most performant version. There is a lot of room for improvement in terms of performance. 

There are multiple levels of nested loops in various places and copies of objects being based around. I have tried to make it as readable and reusable as possible in as short time as possible. 

I was considering building it in go as well and I will do that if I get the time. 
