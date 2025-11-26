# Amazon

After One Medical was acquired by Amazon, I joined Amazon Health working on the Electronic Health Records (EHR) platform that powers patient care across all Amazon Health products.

## Engineering Experience Team

First, I returned to the same Engineering Experience team as the one from [One Medical](/star/one-medical). I completed miscellaneous tickets, but I did work on decomposing the EHR monolith into microservices, which was a strategic initiative for the organization. The monolith had accumulated significant technical debt over time, with circular dependencies tangled across 10+ Ruby packages. I spent time untangling these dependencies, improving modularity and paving the way for future microservice migrations.

I also dove deeper into owning onelife-container, the overall React.js container around most of our UI applications.

## GraphQL Gateway Team

Later on, I was reorganized into a GraphQL Gateway team, building and load tested a GraphQL AWS API Gateway prototype using Apollo Federation to decouple 2 key GraphQL microservices.

I also tackled a performance issue in our gateway. GraphQL requests were taking around 200ms due to CORS preflight handling in a single-region monolith service. I migrated this to AWS CloudFront edge functions, cutting latency in half to 100ms—a 50% improvement.

## Profile Migration Away-Team

My biggest project was rolling out Amazon Health's profile migration feature across all 4 products during a brief away-team experience with the Health Store and Technology Identity team. As the sole owner, I built a reusable TypeScript React package and coordinated with 4 different engineering teams to integrate it into their products. This was a fun challenge in both technical design and cross-team collaboration, making sure the component worked seamlessly across different codebases while maintaining consistency.
