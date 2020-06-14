# Pipeline
Unprocessed thing goes in; processed thing comes out

## What is this?

Have you ever wanted to seemlessly perform a group of semi-related actions to a file, or even just raw data?

Lets say your friend sent you a picture of a table of data, with hundreds of visible rows, and you need to quickly sum up all the values in one its columns. Prehaps you would type it out by hand into a calculator, but that's time consuming and error prone. You'd probably end up cropping it to just contain the column you need in one program, running it through an OCR program, copying the output of that tool into a spreadsheet program, and then writing a formular to sum it.

How about if you had an MP4 file of some object moving against a background, and you want to put it into a presentation program? You'd need to cut the video to contain the portion you need to one program, convert it to a GIF in another, and then remove the background in another program.

What if you needed to take a group of files, crop and filter all of them, and then rename them to match a certain pattern? How about quickly taking a recording of your screen, and then adding text and audio to it? Animating a spritesheet and converting the result to a GIF? Decoding a text cypher revealing a date and timezone, and then checking when sunset is over there? Filling out a PDF form differently from each row of a CSV?

---

On their own, each step of these tasks is easy, and there exist countless programs that do them well. Often, they exist online, on websites with slow servers which may or may not be storing your private data after your done. And while this works well for small tasks, the bigger the task, the harder it is to find these programs and chain them together in an acceptable way. This is always a painful process, which commonly results in dozens of temporary files, frequent conversion between formats, and a lot of wasted time.

---

The UNIX developers solved this problem decades ago. The UNIX command line contains hundreds of tiny programs that can be chained ("piped") together to perform tasks that would otherwise be incredibly difficult.

This tool consists of hundreds of similar programs, which can be chained together visually in a tool heavily inspired by [Unity's Shader Graph](https://unity.com/shader-graph). It all runs client-side in your browser, meaning that you can use it anywhere, and that none of your personal data gets sent to external servers.
