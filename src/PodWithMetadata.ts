import * as Pod from "./Pod";
import * as List from "@effect/data/List";
import * as Data from "@effect/data/Data";
import * as Option from "@effect/data/Option";
import { pipe } from "@effect/data/Function";
import { Order } from "@effect/data/typeclass/Order";

export interface PodWithMetadata {
  pod: Pod.Pod;
  registered: number;
}

export function apply(pod: Pod.Pod, registered: number): PodWithMetadata {
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
