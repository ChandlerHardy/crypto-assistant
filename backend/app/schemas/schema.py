import strawberry
from app.schemas.queries import Query
from app.schemas.mutations import Mutation
from app.schemas.subscriptions import Subscription

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription
)