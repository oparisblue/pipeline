---
name: Node Suggestion
about: For the proposal of new nodes.
title: ''
labels: node-suggestion
assignees: ''

---

Copy and paste the following template for each node you want to suggest:
(Note: to submit multiple nodes in the one issue, they have to be related such that one would not make sense without any of the others. If you just have multiple ideas, please break them up into multiple issues).

-----

**What is the name of the node?**
A working name for the node, e.g.

> Threshold

**What is the purpose of the node?**
A description of the node's purpose, and some motivating examples for its usage. e.g.

 > Performs the [threshold](https://en.wikipedia.org/wiki/Thresholding_(image_processing)) operation on an image, converting the R,G,B values of a pixel to 0, 0, 0 (black) if their average is less than a given number, or to 255, 255, 255 (white) if there average is greater than / equal to the given number.
>
> This is useful as not only an interesting image transformation, but is also often used in image processing tasks - e.g. handwriting recognition, where it can isolate certain parts of the image where colours are more extreme than the rest. Likewise, it can also serve as a basic form of object detection, etc.

**What are the input / outputs for the node?**
A list of all the inputs and outputs that the node has, their names, their purposes, and their types, e.g.

> **Inputs:**
>  Original (Image): the original image to run the transformation on
> Threshold (Number): the value to threshold the value by. The higher this value, the higher the average of a pixel's R, G, B values needs to be for it to be white.
> **Outputs:**
> Output (Image): the output image

**Are there any alternatives / is this already possible with the current set of nodes?**
If this task is already readily covered by the available nodes, then your proposal is likely to be rejected. However, there are some valid cases, e.g. where it improves the workflow (for example, by combining three nodes that are commonly wired together into one, etc), or a native implementation has significant speed improvements over the alternative. This is considered on a case-by-case basis.

> No, no existing nodes can currently be combined to provide this functionality.

-----
