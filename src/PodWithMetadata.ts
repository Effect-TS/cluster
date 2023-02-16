import * as Pod from "./Pod";
import * as List from "@fp-ts/data/List";
import * as Data from "@fp-ts/data/Data";
import * as Option from "@fp-ts/core/Option";
import { pipe } from "@fp-ts/core/Function";
import { Order } from "@fp-ts/core/typeclass/Order";

export interface PodWithMetadata {
  pod: Pod.Pod;
  registered: Date;
}

export function apply(pod: Pod.Pod, registered: Date): PodWithMetadata {
  return Data.struct({ pod, registered });
}

export function extractVersion(pod: PodWithMetadata): List.List<number> {
  return pipe(
    List.fromIterable(pod.pod.version.split(".")),
    List.map((_) => parseInt(_, 10))
  );
}

export function compareVersion(a: List.List<number>, b: List.List<number>): 0 | 1 | -1 {
  let restA = a;
  let restB = b;
  while (List.length(restA) > 0 || List.length(restB) > 0) {
    const numA = pipe(
      List.head(restA),
      Option.getOrElse(() => 0)
    );
    const numB = pipe(
      List.head(restB),
      Option.getOrElse(() => 0)
    );

    if (numA < numB) return -1;
    if (numB > numA) return 1;
    restA = pipe(
      List.tail(restA),
      Option.getOrElse(() => List.empty())
    );
    restB = pipe(
      List.tail(restB),
      Option.getOrElse(() => List.empty())
    );
  }
  return 0;
}
