import Zod from "zod";
import ProblemChart from "../components/Chart";

export const requestSchema = Zod.object({
    id: Zod.string(),
    title: Zod.string(),
    description: Zod.string(),
    pdf: Zod.array(Zod.string()).optional(),
    docCount: Zod.number(),
    createdBy: Zod.string(),
    createdAt: Zod.string(),
    reqStatus: Zod.number(),
});

// export const requestDetailsSchema = Zod.object({
//     id: Zod.string(),
//     title: Zod.string(),
//     createdBy: Zod.string(),
//     createdAt: Zod.string(),
//     reqStatus: Zod.number(),
//     documents: Zod.array(
//         Zod.object({
//             id: Zod.string(),
//             name: Zod.string(),
//             phoneNumber: Zod.string().optional(),
//             ward: Zod.string().optional(),
//             countryCode: Zod.string().optional(),
//             issues: Zod.array(
//                 Zod.string()
//             ),
//             problems: Zod.array(
//                 Zod.object({
//                     category: Zod.array(Zod.string()),
//                     description: Zod.object({
//                         english: Zod.string(),
//                         hindi: Zod.string()
//                     })
//                 })
//             )
//         })
//     )
// });

export const requestDetailsSchema = Zod.object({
  id: Zod.string(),
  title: Zod.string(),
  createdBy: Zod.string(),
  createdAt: Zod.string(),
  reqStatus: Zod.number(),
  documents: Zod.array(
    Zod.object({
      id: Zod.string(),
      name: Zod.string(),
      phoneNumber: Zod.string().nullable().optional(),
      ward: Zod.string().nullable().optional(),
      countryCode: Zod.string().nullable().optional(),
      issues: Zod.array(Zod.string()),
      problems: Zod.array(
        Zod.object({
          category: Zod.array(Zod.string()),
          description: Zod.object({
            english: Zod.string(),
            hindi: Zod.string(),
            _id: Zod.string().optional(),
          }).passthrough(),
          id: Zod.string().optional(),
          _id: Zod.string().optional(),
        }).passthrough()
      ),
      imageUrl: Zod.string().optional(),
      _id: Zod.string().optional(),
    }).passthrough()
  ),
  _id: Zod.string().optional(),
}).passthrough();

export const documentDetailsSchema = Zod.object({
  id: Zod.string(),
  name: Zod.string(),
  phoneNumber: Zod.string().optional().nullable(),
  ward: Zod.string().optional().nullable(),
  countryCode: Zod.string().optional().nullable(),
  issues: Zod.array(Zod.string()),
  problems: Zod.array(
    Zod.object({
      id: Zod.string().min(1),
      category: Zod.array(Zod.string()),
      description: Zod.object({
        english: Zod.string(),
        hindi: Zod.string(),
      }).passthrough(),
    }).passthrough()
  ),
}).passthrough();

// export const documentDetailsSchema = Zod.object({
//     id: Zod.string(),
//     name: Zod.string(),
//     phoneNumber: Zod.string().optional(),
//     ward: Zod.string().optional(),
//     countryCode: Zod.string().optional(),
//     issues: Zod.array(
//         Zod.string()
//     ),
//     problems: Zod.array(
//         Zod.object({
//             id: Zod.string().min(1),
//             category: Zod.array(Zod.string()),
//             description: Zod.object({
//                 english: Zod.string(),
//                 hindi: Zod.string()
//             })
//         })
//     )
// });

export const issueDetailsSchema = Zod.object({
  id: Zod.string(),
  name: Zod.string(),
  phoneNumber: Zod.string().nullable().optional(),
  ward: Zod.string().nullable().optional(),
  countryCode: Zod.string().nullable().optional(),
  issues: Zod.array(Zod.string()),
  imageUrl: Zod.string().optional(),
  _id: Zod.string().optional(),
  problems: Zod.array(
    Zod.object({
      category: Zod.array(Zod.string()),
      id: Zod.string().optional(),
      _id: Zod.string().optional(),
      description: Zod.object({
        english: Zod.string(),
        hindi: Zod.string(),
        _id: Zod.string().optional(),
      }),
    }).passthrough()
  ),
}).passthrough();


export const commonProblemsSchema = Zod.object({
    title: Zod.string(),
    commonProblems: Zod.array(
        Zod.object({
            id: Zod.string().min(1),
            issues: Zod.array(Zod.string()),
            problemIds: Zod.array(
                Zod.object({
                    docId: Zod.string().min(1),
                    problemId: Zod.string().min(1)
                })
            ),
            summary: Zod.string(),
        })
    ),
})

export const wardProblemsSchema = Zod.object({
    reqId: Zod.string().min(1),
    wards: Zod.array(
        Zod.object({
            wardId: Zod.string().min(1),
            ward: Zod.string(),
            category: Zod.string().min(1),
            problems: Zod.array(
                Zod.object({
                    issues: Zod.array(Zod.string()),
                    problemIds: Zod.array(
                        Zod.object({
                            docId: Zod.string().min(1),
                            problemId: Zod.string().min(1)
                        })
                    ),
                    summary: Zod.string(),
                })
            )
    }))
})

export const analysisSchema = Zod.array(
    Zod.object({
        ward: Zod.string(),
        totalProblems: Zod.number(),
        category: Zod.array(
            Zod.object({
                issue: Zod.string(),
                problemCount: Zod.number(),
            })
        )
    })
)

export const wardAnalysisSchema = Zod.object({
  id: Zod.string(),
  _id: Zod.string().optional(),
  name: Zod.string(),
  ward: Zod.string().nullable().optional(),
  phoneNumber: Zod.string().nullable().optional(),
  problems: Zod.object({
    category: Zod.array( Zod.string()),
    description: Zod.object({
      english: Zod.string(),
      hindi: Zod.string(),
      _id: Zod.string().min(1).optional(),
    }),
    id: Zod.string().min(1).optional(),
    _id: Zod.string().min(1).optional(),
  })
})