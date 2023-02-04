import * as Pod from "./Pod";
import * as List from "@fp-ts/data/List";
import * as Data from "@fp-ts/data/Data";
import { pipe } from "@fp-ts/core/Function";

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
