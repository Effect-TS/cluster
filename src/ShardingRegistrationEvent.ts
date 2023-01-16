import { EntityType, TopicType } from "./RecipientType";

interface EntityRegistered<A> {
  _tag: "EntityRegistered";
  entityType: EntityType<A>;
}
interface SingletonRegistered {
  _tag: "SingletonRegistered";
  name: string;
}

interface TopicRegistered<A> {
  _tag: "TopicRegistered";
  topicType: TopicType<A>;
}

export type ShardingRegistrationEvent =
  | EntityRegistered<any>
  | SingletonRegistered
  | TopicRegistered<any>;
