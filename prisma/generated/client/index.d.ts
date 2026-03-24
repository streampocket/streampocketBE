
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model Code
 * 
 */
export type Code = $Result.DefaultSelection<Prisma.$CodePayload>
/**
 * Model Order
 * 
 */
export type Order = $Result.DefaultSelection<Prisma.$OrderPayload>
/**
 * Model OrderItem
 * 
 */
export type OrderItem = $Result.DefaultSelection<Prisma.$OrderItemPayload>
/**
 * Model CodeAssignment
 * 
 */
export type CodeAssignment = $Result.DefaultSelection<Prisma.$CodeAssignmentPayload>
/**
 * Model FulfillmentJob
 * 
 */
export type FulfillmentJob = $Result.DefaultSelection<Prisma.$FulfillmentJobPayload>
/**
 * Model EmailLog
 * 
 */
export type EmailLog = $Result.DefaultSelection<Prisma.$EmailLogPayload>
/**
 * Model MailTemplate
 * 
 */
export type MailTemplate = $Result.DefaultSelection<Prisma.$MailTemplatePayload>
/**
 * Model InventoryAlertState
 * 
 */
export type InventoryAlertState = $Result.DefaultSelection<Prisma.$InventoryAlertStatePayload>
/**
 * Model SystemSetting
 * 
 */
export type SystemSetting = $Result.DefaultSelection<Prisma.$SystemSettingPayload>
/**
 * Model DiscordAlertLog
 * 
 */
export type DiscordAlertLog = $Result.DefaultSelection<Prisma.$DiscordAlertLogPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Platform: {
  NAVER: 'NAVER',
  OWN: 'OWN'
};

export type Platform = (typeof Platform)[keyof typeof Platform]


export const ProductStatus: {
  draft: 'draft',
  active: 'active',
  inactive: 'inactive'
};

export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus]


export const CodeStatus: {
  available: 'available',
  reserved: 'reserved',
  sent: 'sent',
  disabled: 'disabled'
};

export type CodeStatus = (typeof CodeStatus)[keyof typeof CodeStatus]


export const OrderItemFulfillmentStatus: {
  pending: 'pending',
  awaiting_code: 'awaiting_code',
  manual_review: 'manual_review',
  processing: 'processing',
  dispatch_done_email_pending: 'dispatch_done_email_pending',
  completed: 'completed',
  error_retryable: 'error_retryable',
  error_final: 'error_final',
  locked: 'locked'
};

export type OrderItemFulfillmentStatus = (typeof OrderItemFulfillmentStatus)[keyof typeof OrderItemFulfillmentStatus]


export const CodeAssignmentStatus: {
  reserved: 'reserved',
  sent: 'sent',
  released: 'released'
};

export type CodeAssignmentStatus = (typeof CodeAssignmentStatus)[keyof typeof CodeAssignmentStatus]


export const FulfillmentJobStatus: {
  queued: 'queued',
  processing: 'processing',
  succeeded: 'succeeded',
  failed: 'failed'
};

export type FulfillmentJobStatus = (typeof FulfillmentJobStatus)[keyof typeof FulfillmentJobStatus]


export const EmailLogStatus: {
  queued: 'queued',
  sent: 'sent',
  failed: 'failed'
};

export type EmailLogStatus = (typeof EmailLogStatus)[keyof typeof EmailLogStatus]

}

export type Platform = $Enums.Platform

export const Platform: typeof $Enums.Platform

export type ProductStatus = $Enums.ProductStatus

export const ProductStatus: typeof $Enums.ProductStatus

export type CodeStatus = $Enums.CodeStatus

export const CodeStatus: typeof $Enums.CodeStatus

export type OrderItemFulfillmentStatus = $Enums.OrderItemFulfillmentStatus

export const OrderItemFulfillmentStatus: typeof $Enums.OrderItemFulfillmentStatus

export type CodeAssignmentStatus = $Enums.CodeAssignmentStatus

export const CodeAssignmentStatus: typeof $Enums.CodeAssignmentStatus

export type FulfillmentJobStatus = $Enums.FulfillmentJobStatus

export const FulfillmentJobStatus: typeof $Enums.FulfillmentJobStatus

export type EmailLogStatus = $Enums.EmailLogStatus

export const EmailLogStatus: typeof $Enums.EmailLogStatus

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Products
 * const products = await prisma.product.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Products
   * const products = await prisma.product.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.code`: Exposes CRUD operations for the **Code** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Codes
    * const codes = await prisma.code.findMany()
    * ```
    */
  get code(): Prisma.CodeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.order`: Exposes CRUD operations for the **Order** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Orders
    * const orders = await prisma.order.findMany()
    * ```
    */
  get order(): Prisma.OrderDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orderItem`: Exposes CRUD operations for the **OrderItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrderItems
    * const orderItems = await prisma.orderItem.findMany()
    * ```
    */
  get orderItem(): Prisma.OrderItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.codeAssignment`: Exposes CRUD operations for the **CodeAssignment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CodeAssignments
    * const codeAssignments = await prisma.codeAssignment.findMany()
    * ```
    */
  get codeAssignment(): Prisma.CodeAssignmentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.fulfillmentJob`: Exposes CRUD operations for the **FulfillmentJob** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more FulfillmentJobs
    * const fulfillmentJobs = await prisma.fulfillmentJob.findMany()
    * ```
    */
  get fulfillmentJob(): Prisma.FulfillmentJobDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.emailLog`: Exposes CRUD operations for the **EmailLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more EmailLogs
    * const emailLogs = await prisma.emailLog.findMany()
    * ```
    */
  get emailLog(): Prisma.EmailLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.mailTemplate`: Exposes CRUD operations for the **MailTemplate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MailTemplates
    * const mailTemplates = await prisma.mailTemplate.findMany()
    * ```
    */
  get mailTemplate(): Prisma.MailTemplateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.inventoryAlertState`: Exposes CRUD operations for the **InventoryAlertState** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InventoryAlertStates
    * const inventoryAlertStates = await prisma.inventoryAlertState.findMany()
    * ```
    */
  get inventoryAlertState(): Prisma.InventoryAlertStateDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.systemSetting`: Exposes CRUD operations for the **SystemSetting** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SystemSettings
    * const systemSettings = await prisma.systemSetting.findMany()
    * ```
    */
  get systemSetting(): Prisma.SystemSettingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.discordAlertLog`: Exposes CRUD operations for the **DiscordAlertLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DiscordAlertLogs
    * const discordAlertLogs = await prisma.discordAlertLog.findMany()
    * ```
    */
  get discordAlertLog(): Prisma.DiscordAlertLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Product: 'Product',
    Code: 'Code',
    Order: 'Order',
    OrderItem: 'OrderItem',
    CodeAssignment: 'CodeAssignment',
    FulfillmentJob: 'FulfillmentJob',
    EmailLog: 'EmailLog',
    MailTemplate: 'MailTemplate',
    InventoryAlertState: 'InventoryAlertState',
    SystemSetting: 'SystemSetting',
    DiscordAlertLog: 'DiscordAlertLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "product" | "code" | "order" | "orderItem" | "codeAssignment" | "fulfillmentJob" | "emailLog" | "mailTemplate" | "inventoryAlertState" | "systemSetting" | "discordAlertLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProductUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      Code: {
        payload: Prisma.$CodePayload<ExtArgs>
        fields: Prisma.CodeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CodeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CodeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          findFirst: {
            args: Prisma.CodeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CodeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          findMany: {
            args: Prisma.CodeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>[]
          }
          create: {
            args: Prisma.CodeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          createMany: {
            args: Prisma.CodeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CodeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>[]
          }
          delete: {
            args: Prisma.CodeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          update: {
            args: Prisma.CodeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          deleteMany: {
            args: Prisma.CodeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CodeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CodeUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>[]
          }
          upsert: {
            args: Prisma.CodeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodePayload>
          }
          aggregate: {
            args: Prisma.CodeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCode>
          }
          groupBy: {
            args: Prisma.CodeGroupByArgs<ExtArgs>
            result: $Utils.Optional<CodeGroupByOutputType>[]
          }
          count: {
            args: Prisma.CodeCountArgs<ExtArgs>
            result: $Utils.Optional<CodeCountAggregateOutputType> | number
          }
        }
      }
      Order: {
        payload: Prisma.$OrderPayload<ExtArgs>
        fields: Prisma.OrderFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findFirst: {
            args: Prisma.OrderFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          findMany: {
            args: Prisma.OrderFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          create: {
            args: Prisma.OrderCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          createMany: {
            args: Prisma.OrderCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          delete: {
            args: Prisma.OrderDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          update: {
            args: Prisma.OrderUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          deleteMany: {
            args: Prisma.OrderDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrderUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>[]
          }
          upsert: {
            args: Prisma.OrderUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderPayload>
          }
          aggregate: {
            args: Prisma.OrderAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrder>
          }
          groupBy: {
            args: Prisma.OrderGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderCountArgs<ExtArgs>
            result: $Utils.Optional<OrderCountAggregateOutputType> | number
          }
        }
      }
      OrderItem: {
        payload: Prisma.$OrderItemPayload<ExtArgs>
        fields: Prisma.OrderItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          findFirst: {
            args: Prisma.OrderItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          findMany: {
            args: Prisma.OrderItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>[]
          }
          create: {
            args: Prisma.OrderItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          createMany: {
            args: Prisma.OrderItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>[]
          }
          delete: {
            args: Prisma.OrderItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          update: {
            args: Prisma.OrderItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          deleteMany: {
            args: Prisma.OrderItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrderItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>[]
          }
          upsert: {
            args: Prisma.OrderItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderItemPayload>
          }
          aggregate: {
            args: Prisma.OrderItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrderItem>
          }
          groupBy: {
            args: Prisma.OrderItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderItemCountArgs<ExtArgs>
            result: $Utils.Optional<OrderItemCountAggregateOutputType> | number
          }
        }
      }
      CodeAssignment: {
        payload: Prisma.$CodeAssignmentPayload<ExtArgs>
        fields: Prisma.CodeAssignmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CodeAssignmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodeAssignmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CodeAssignmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodeAssignmentPayload>
          }
          findFirst: {
            args: Prisma.CodeAssignmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodeAssignmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CodeAssignmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodeAssignmentPayload>
          }
          findMany: {
            args: Prisma.CodeAssignmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodeAssignmentPayload>[]
          }
          create: {
            args: Prisma.CodeAssignmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodeAssignmentPayload>
          }
          createMany: {
            args: Prisma.CodeAssignmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CodeAssignmentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodeAssignmentPayload>[]
          }
          delete: {
            args: Prisma.CodeAssignmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodeAssignmentPayload>
          }
          update: {
            args: Prisma.CodeAssignmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodeAssignmentPayload>
          }
          deleteMany: {
            args: Prisma.CodeAssignmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CodeAssignmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.CodeAssignmentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodeAssignmentPayload>[]
          }
          upsert: {
            args: Prisma.CodeAssignmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CodeAssignmentPayload>
          }
          aggregate: {
            args: Prisma.CodeAssignmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCodeAssignment>
          }
          groupBy: {
            args: Prisma.CodeAssignmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<CodeAssignmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.CodeAssignmentCountArgs<ExtArgs>
            result: $Utils.Optional<CodeAssignmentCountAggregateOutputType> | number
          }
        }
      }
      FulfillmentJob: {
        payload: Prisma.$FulfillmentJobPayload<ExtArgs>
        fields: Prisma.FulfillmentJobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.FulfillmentJobFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FulfillmentJobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.FulfillmentJobFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FulfillmentJobPayload>
          }
          findFirst: {
            args: Prisma.FulfillmentJobFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FulfillmentJobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.FulfillmentJobFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FulfillmentJobPayload>
          }
          findMany: {
            args: Prisma.FulfillmentJobFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FulfillmentJobPayload>[]
          }
          create: {
            args: Prisma.FulfillmentJobCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FulfillmentJobPayload>
          }
          createMany: {
            args: Prisma.FulfillmentJobCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.FulfillmentJobCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FulfillmentJobPayload>[]
          }
          delete: {
            args: Prisma.FulfillmentJobDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FulfillmentJobPayload>
          }
          update: {
            args: Prisma.FulfillmentJobUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FulfillmentJobPayload>
          }
          deleteMany: {
            args: Prisma.FulfillmentJobDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.FulfillmentJobUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.FulfillmentJobUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FulfillmentJobPayload>[]
          }
          upsert: {
            args: Prisma.FulfillmentJobUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$FulfillmentJobPayload>
          }
          aggregate: {
            args: Prisma.FulfillmentJobAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateFulfillmentJob>
          }
          groupBy: {
            args: Prisma.FulfillmentJobGroupByArgs<ExtArgs>
            result: $Utils.Optional<FulfillmentJobGroupByOutputType>[]
          }
          count: {
            args: Prisma.FulfillmentJobCountArgs<ExtArgs>
            result: $Utils.Optional<FulfillmentJobCountAggregateOutputType> | number
          }
        }
      }
      EmailLog: {
        payload: Prisma.$EmailLogPayload<ExtArgs>
        fields: Prisma.EmailLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmailLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmailLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogPayload>
          }
          findFirst: {
            args: Prisma.EmailLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmailLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogPayload>
          }
          findMany: {
            args: Prisma.EmailLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogPayload>[]
          }
          create: {
            args: Prisma.EmailLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogPayload>
          }
          createMany: {
            args: Prisma.EmailLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmailLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogPayload>[]
          }
          delete: {
            args: Prisma.EmailLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogPayload>
          }
          update: {
            args: Prisma.EmailLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogPayload>
          }
          deleteMany: {
            args: Prisma.EmailLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmailLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.EmailLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogPayload>[]
          }
          upsert: {
            args: Prisma.EmailLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmailLogPayload>
          }
          aggregate: {
            args: Prisma.EmailLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmailLog>
          }
          groupBy: {
            args: Prisma.EmailLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmailLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmailLogCountArgs<ExtArgs>
            result: $Utils.Optional<EmailLogCountAggregateOutputType> | number
          }
        }
      }
      MailTemplate: {
        payload: Prisma.$MailTemplatePayload<ExtArgs>
        fields: Prisma.MailTemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MailTemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MailTemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MailTemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MailTemplatePayload>
          }
          findFirst: {
            args: Prisma.MailTemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MailTemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MailTemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MailTemplatePayload>
          }
          findMany: {
            args: Prisma.MailTemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MailTemplatePayload>[]
          }
          create: {
            args: Prisma.MailTemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MailTemplatePayload>
          }
          createMany: {
            args: Prisma.MailTemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MailTemplateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MailTemplatePayload>[]
          }
          delete: {
            args: Prisma.MailTemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MailTemplatePayload>
          }
          update: {
            args: Prisma.MailTemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MailTemplatePayload>
          }
          deleteMany: {
            args: Prisma.MailTemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MailTemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MailTemplateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MailTemplatePayload>[]
          }
          upsert: {
            args: Prisma.MailTemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MailTemplatePayload>
          }
          aggregate: {
            args: Prisma.MailTemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMailTemplate>
          }
          groupBy: {
            args: Prisma.MailTemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<MailTemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.MailTemplateCountArgs<ExtArgs>
            result: $Utils.Optional<MailTemplateCountAggregateOutputType> | number
          }
        }
      }
      InventoryAlertState: {
        payload: Prisma.$InventoryAlertStatePayload<ExtArgs>
        fields: Prisma.InventoryAlertStateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InventoryAlertStateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertStatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InventoryAlertStateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertStatePayload>
          }
          findFirst: {
            args: Prisma.InventoryAlertStateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertStatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InventoryAlertStateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertStatePayload>
          }
          findMany: {
            args: Prisma.InventoryAlertStateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertStatePayload>[]
          }
          create: {
            args: Prisma.InventoryAlertStateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertStatePayload>
          }
          createMany: {
            args: Prisma.InventoryAlertStateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InventoryAlertStateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertStatePayload>[]
          }
          delete: {
            args: Prisma.InventoryAlertStateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertStatePayload>
          }
          update: {
            args: Prisma.InventoryAlertStateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertStatePayload>
          }
          deleteMany: {
            args: Prisma.InventoryAlertStateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InventoryAlertStateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InventoryAlertStateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertStatePayload>[]
          }
          upsert: {
            args: Prisma.InventoryAlertStateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertStatePayload>
          }
          aggregate: {
            args: Prisma.InventoryAlertStateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInventoryAlertState>
          }
          groupBy: {
            args: Prisma.InventoryAlertStateGroupByArgs<ExtArgs>
            result: $Utils.Optional<InventoryAlertStateGroupByOutputType>[]
          }
          count: {
            args: Prisma.InventoryAlertStateCountArgs<ExtArgs>
            result: $Utils.Optional<InventoryAlertStateCountAggregateOutputType> | number
          }
        }
      }
      SystemSetting: {
        payload: Prisma.$SystemSettingPayload<ExtArgs>
        fields: Prisma.SystemSettingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SystemSettingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemSettingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SystemSettingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemSettingPayload>
          }
          findFirst: {
            args: Prisma.SystemSettingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemSettingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SystemSettingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemSettingPayload>
          }
          findMany: {
            args: Prisma.SystemSettingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemSettingPayload>[]
          }
          create: {
            args: Prisma.SystemSettingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemSettingPayload>
          }
          createMany: {
            args: Prisma.SystemSettingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SystemSettingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemSettingPayload>[]
          }
          delete: {
            args: Prisma.SystemSettingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemSettingPayload>
          }
          update: {
            args: Prisma.SystemSettingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemSettingPayload>
          }
          deleteMany: {
            args: Prisma.SystemSettingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SystemSettingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SystemSettingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemSettingPayload>[]
          }
          upsert: {
            args: Prisma.SystemSettingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemSettingPayload>
          }
          aggregate: {
            args: Prisma.SystemSettingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSystemSetting>
          }
          groupBy: {
            args: Prisma.SystemSettingGroupByArgs<ExtArgs>
            result: $Utils.Optional<SystemSettingGroupByOutputType>[]
          }
          count: {
            args: Prisma.SystemSettingCountArgs<ExtArgs>
            result: $Utils.Optional<SystemSettingCountAggregateOutputType> | number
          }
        }
      }
      DiscordAlertLog: {
        payload: Prisma.$DiscordAlertLogPayload<ExtArgs>
        fields: Prisma.DiscordAlertLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DiscordAlertLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiscordAlertLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DiscordAlertLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiscordAlertLogPayload>
          }
          findFirst: {
            args: Prisma.DiscordAlertLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiscordAlertLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DiscordAlertLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiscordAlertLogPayload>
          }
          findMany: {
            args: Prisma.DiscordAlertLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiscordAlertLogPayload>[]
          }
          create: {
            args: Prisma.DiscordAlertLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiscordAlertLogPayload>
          }
          createMany: {
            args: Prisma.DiscordAlertLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DiscordAlertLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiscordAlertLogPayload>[]
          }
          delete: {
            args: Prisma.DiscordAlertLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiscordAlertLogPayload>
          }
          update: {
            args: Prisma.DiscordAlertLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiscordAlertLogPayload>
          }
          deleteMany: {
            args: Prisma.DiscordAlertLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DiscordAlertLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DiscordAlertLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiscordAlertLogPayload>[]
          }
          upsert: {
            args: Prisma.DiscordAlertLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DiscordAlertLogPayload>
          }
          aggregate: {
            args: Prisma.DiscordAlertLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDiscordAlertLog>
          }
          groupBy: {
            args: Prisma.DiscordAlertLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<DiscordAlertLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.DiscordAlertLogCountArgs<ExtArgs>
            result: $Utils.Optional<DiscordAlertLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    product?: ProductOmit
    code?: CodeOmit
    order?: OrderOmit
    orderItem?: OrderItemOmit
    codeAssignment?: CodeAssignmentOmit
    fulfillmentJob?: FulfillmentJobOmit
    emailLog?: EmailLogOmit
    mailTemplate?: MailTemplateOmit
    inventoryAlertState?: InventoryAlertStateOmit
    systemSetting?: SystemSettingOmit
    discordAlertLog?: DiscordAlertLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ProductCountOutputType
   */

  export type ProductCountOutputType = {
    codes: number
    orderItems: number
  }

  export type ProductCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    codes?: boolean | ProductCountOutputTypeCountCodesArgs
    orderItems?: boolean | ProductCountOutputTypeCountOrderItemsArgs
  }

  // Custom InputTypes
  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCountOutputType
     */
    select?: ProductCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountCodesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CodeWhereInput
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountOrderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
  }


  /**
   * Count Type CodeCountOutputType
   */

  export type CodeCountOutputType = {
    assignments: number
  }

  export type CodeCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    assignments?: boolean | CodeCountOutputTypeCountAssignmentsArgs
  }

  // Custom InputTypes
  /**
   * CodeCountOutputType without action
   */
  export type CodeCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeCountOutputType
     */
    select?: CodeCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CodeCountOutputType without action
   */
  export type CodeCountOutputTypeCountAssignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CodeAssignmentWhereInput
  }


  /**
   * Count Type OrderCountOutputType
   */

  export type OrderCountOutputType = {
    orderItems: number
  }

  export type OrderCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItems?: boolean | OrderCountOutputTypeCountOrderItemsArgs
  }

  // Custom InputTypes
  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderCountOutputType
     */
    select?: OrderCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrderCountOutputType without action
   */
  export type OrderCountOutputTypeCountOrderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
  }


  /**
   * Count Type OrderItemCountOutputType
   */

  export type OrderItemCountOutputType = {
    fulfillmentJobs: number
    emailLogs: number
  }

  export type OrderItemCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    fulfillmentJobs?: boolean | OrderItemCountOutputTypeCountFulfillmentJobsArgs
    emailLogs?: boolean | OrderItemCountOutputTypeCountEmailLogsArgs
  }

  // Custom InputTypes
  /**
   * OrderItemCountOutputType without action
   */
  export type OrderItemCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItemCountOutputType
     */
    select?: OrderItemCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrderItemCountOutputType without action
   */
  export type OrderItemCountOutputTypeCountFulfillmentJobsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FulfillmentJobWhereInput
  }

  /**
   * OrderItemCountOutputType without action
   */
  export type OrderItemCountOutputTypeCountEmailLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailLogWhereInput
  }


  /**
   * Count Type MailTemplateCountOutputType
   */

  export type MailTemplateCountOutputType = {
    products: number
  }

  export type MailTemplateCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | MailTemplateCountOutputTypeCountProductsArgs
  }

  // Custom InputTypes
  /**
   * MailTemplateCountOutputType without action
   */
  export type MailTemplateCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplateCountOutputType
     */
    select?: MailTemplateCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * MailTemplateCountOutputType without action
   */
  export type MailTemplateCountOutputTypeCountProductsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    price: number | null
  }

  export type ProductSumAggregateOutputType = {
    price: number | null
  }

  export type ProductMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    price: number | null
    internalProductCode: string | null
    naverProductId: string | null
    sellerManagementCode: string | null
    emailOptionName: string | null
    mailTemplateId: string | null
    status: $Enums.ProductStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    price: number | null
    internalProductCode: string | null
    naverProductId: string | null
    sellerManagementCode: string | null
    emailOptionName: string | null
    mailTemplateId: string | null
    status: $Enums.ProductStatus | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    name: number
    description: number
    price: number
    internalProductCode: number
    naverProductId: number
    sellerManagementCode: number
    emailOptionName: number
    mailTemplateId: number
    status: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    price?: true
  }

  export type ProductSumAggregateInputType = {
    price?: true
  }

  export type ProductMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    price?: true
    internalProductCode?: true
    naverProductId?: true
    sellerManagementCode?: true
    emailOptionName?: true
    mailTemplateId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    price?: true
    internalProductCode?: true
    naverProductId?: true
    sellerManagementCode?: true
    emailOptionName?: true
    mailTemplateId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    price?: true
    internalProductCode?: true
    naverProductId?: true
    sellerManagementCode?: true
    emailOptionName?: true
    mailTemplateId?: true
    status?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: string
    name: string
    description: string | null
    price: number
    internalProductCode: string
    naverProductId: string | null
    sellerManagementCode: string
    emailOptionName: string
    mailTemplateId: string | null
    status: $Enums.ProductStatus
    createdAt: Date
    updatedAt: Date
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    internalProductCode?: boolean
    naverProductId?: boolean
    sellerManagementCode?: boolean
    emailOptionName?: boolean
    mailTemplateId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    codes?: boolean | Product$codesArgs<ExtArgs>
    orderItems?: boolean | Product$orderItemsArgs<ExtArgs>
    inventoryAlertState?: boolean | Product$inventoryAlertStateArgs<ExtArgs>
    mailTemplate?: boolean | Product$mailTemplateArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    internalProductCode?: boolean
    naverProductId?: boolean
    sellerManagementCode?: boolean
    emailOptionName?: boolean
    mailTemplateId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    mailTemplate?: boolean | Product$mailTemplateArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    internalProductCode?: boolean
    naverProductId?: boolean
    sellerManagementCode?: boolean
    emailOptionName?: boolean
    mailTemplateId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    mailTemplate?: boolean | Product$mailTemplateArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    internalProductCode?: boolean
    naverProductId?: boolean
    sellerManagementCode?: boolean
    emailOptionName?: boolean
    mailTemplateId?: boolean
    status?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "price" | "internalProductCode" | "naverProductId" | "sellerManagementCode" | "emailOptionName" | "mailTemplateId" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["product"]>
  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    codes?: boolean | Product$codesArgs<ExtArgs>
    orderItems?: boolean | Product$orderItemsArgs<ExtArgs>
    inventoryAlertState?: boolean | Product$inventoryAlertStateArgs<ExtArgs>
    mailTemplate?: boolean | Product$mailTemplateArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    mailTemplate?: boolean | Product$mailTemplateArgs<ExtArgs>
  }
  export type ProductIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    mailTemplate?: boolean | Product$mailTemplateArgs<ExtArgs>
  }

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      codes: Prisma.$CodePayload<ExtArgs>[]
      orderItems: Prisma.$OrderItemPayload<ExtArgs>[]
      inventoryAlertState: Prisma.$InventoryAlertStatePayload<ExtArgs> | null
      mailTemplate: Prisma.$MailTemplatePayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      price: number
      internalProductCode: string
      naverProductId: string | null
      sellerManagementCode: string
      emailOptionName: string
      mailTemplateId: string | null
      status: $Enums.ProductStatus
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productWithIdOnly = await prisma.product.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products and returns the data updated in the database.
     * @param {ProductUpdateManyAndReturnArgs} args - Arguments to update many Products.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Products and only return the `id`
     * const productWithIdOnly = await prisma.product.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProductUpdateManyAndReturnArgs>(args: SelectSubset<T, ProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    codes<T extends Product$codesArgs<ExtArgs> = {}>(args?: Subset<T, Product$codesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    orderItems<T extends Product$orderItemsArgs<ExtArgs> = {}>(args?: Subset<T, Product$orderItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    inventoryAlertState<T extends Product$inventoryAlertStateArgs<ExtArgs> = {}>(args?: Subset<T, Product$inventoryAlertStateArgs<ExtArgs>>): Prisma__InventoryAlertStateClient<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    mailTemplate<T extends Product$mailTemplateArgs<ExtArgs> = {}>(args?: Subset<T, Product$mailTemplateArgs<ExtArgs>>): Prisma__MailTemplateClient<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Product model
   */
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'String'>
    readonly name: FieldRef<"Product", 'String'>
    readonly description: FieldRef<"Product", 'String'>
    readonly price: FieldRef<"Product", 'Int'>
    readonly internalProductCode: FieldRef<"Product", 'String'>
    readonly naverProductId: FieldRef<"Product", 'String'>
    readonly sellerManagementCode: FieldRef<"Product", 'String'>
    readonly emailOptionName: FieldRef<"Product", 'String'>
    readonly mailTemplateId: FieldRef<"Product", 'String'>
    readonly status: FieldRef<"Product", 'ProductStatus'>
    readonly createdAt: FieldRef<"Product", 'DateTime'>
    readonly updatedAt: FieldRef<"Product", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product updateManyAndReturn
   */
  export type ProductUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to delete.
     */
    limit?: number
  }

  /**
   * Product.codes
   */
  export type Product$codesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeInclude<ExtArgs> | null
    where?: CodeWhereInput
    orderBy?: CodeOrderByWithRelationInput | CodeOrderByWithRelationInput[]
    cursor?: CodeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CodeScalarFieldEnum | CodeScalarFieldEnum[]
  }

  /**
   * Product.orderItems
   */
  export type Product$orderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    cursor?: OrderItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * Product.inventoryAlertState
   */
  export type Product$inventoryAlertStateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateInclude<ExtArgs> | null
    where?: InventoryAlertStateWhereInput
  }

  /**
   * Product.mailTemplate
   */
  export type Product$mailTemplateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MailTemplateInclude<ExtArgs> | null
    where?: MailTemplateWhereInput
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model Code
   */

  export type AggregateCode = {
    _count: CodeCountAggregateOutputType | null
    _avg: CodeAvgAggregateOutputType | null
    _sum: CodeSumAggregateOutputType | null
    _min: CodeMinAggregateOutputType | null
    _max: CodeMaxAggregateOutputType | null
  }

  export type CodeAvgAggregateOutputType = {
    sequenceNo: number | null
  }

  export type CodeSumAggregateOutputType = {
    sequenceNo: number | null
  }

  export type CodeMinAggregateOutputType = {
    id: string | null
    productId: string | null
    codeValue: string | null
    sequenceNo: number | null
    status: $Enums.CodeStatus | null
    reservedAt: Date | null
    sentAt: Date | null
    createdAt: Date | null
  }

  export type CodeMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    codeValue: string | null
    sequenceNo: number | null
    status: $Enums.CodeStatus | null
    reservedAt: Date | null
    sentAt: Date | null
    createdAt: Date | null
  }

  export type CodeCountAggregateOutputType = {
    id: number
    productId: number
    codeValue: number
    sequenceNo: number
    status: number
    reservedAt: number
    sentAt: number
    createdAt: number
    _all: number
  }


  export type CodeAvgAggregateInputType = {
    sequenceNo?: true
  }

  export type CodeSumAggregateInputType = {
    sequenceNo?: true
  }

  export type CodeMinAggregateInputType = {
    id?: true
    productId?: true
    codeValue?: true
    sequenceNo?: true
    status?: true
    reservedAt?: true
    sentAt?: true
    createdAt?: true
  }

  export type CodeMaxAggregateInputType = {
    id?: true
    productId?: true
    codeValue?: true
    sequenceNo?: true
    status?: true
    reservedAt?: true
    sentAt?: true
    createdAt?: true
  }

  export type CodeCountAggregateInputType = {
    id?: true
    productId?: true
    codeValue?: true
    sequenceNo?: true
    status?: true
    reservedAt?: true
    sentAt?: true
    createdAt?: true
    _all?: true
  }

  export type CodeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Code to aggregate.
     */
    where?: CodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codes to fetch.
     */
    orderBy?: CodeOrderByWithRelationInput | CodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Codes
    **/
    _count?: true | CodeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CodeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CodeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CodeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CodeMaxAggregateInputType
  }

  export type GetCodeAggregateType<T extends CodeAggregateArgs> = {
        [P in keyof T & keyof AggregateCode]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCode[P]>
      : GetScalarType<T[P], AggregateCode[P]>
  }




  export type CodeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CodeWhereInput
    orderBy?: CodeOrderByWithAggregationInput | CodeOrderByWithAggregationInput[]
    by: CodeScalarFieldEnum[] | CodeScalarFieldEnum
    having?: CodeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CodeCountAggregateInputType | true
    _avg?: CodeAvgAggregateInputType
    _sum?: CodeSumAggregateInputType
    _min?: CodeMinAggregateInputType
    _max?: CodeMaxAggregateInputType
  }

  export type CodeGroupByOutputType = {
    id: string
    productId: string
    codeValue: string
    sequenceNo: number
    status: $Enums.CodeStatus
    reservedAt: Date | null
    sentAt: Date | null
    createdAt: Date
    _count: CodeCountAggregateOutputType | null
    _avg: CodeAvgAggregateOutputType | null
    _sum: CodeSumAggregateOutputType | null
    _min: CodeMinAggregateOutputType | null
    _max: CodeMaxAggregateOutputType | null
  }

  type GetCodeGroupByPayload<T extends CodeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CodeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CodeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CodeGroupByOutputType[P]>
            : GetScalarType<T[P], CodeGroupByOutputType[P]>
        }
      >
    >


  export type CodeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    codeValue?: boolean
    sequenceNo?: boolean
    status?: boolean
    reservedAt?: boolean
    sentAt?: boolean
    createdAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
    assignments?: boolean | Code$assignmentsArgs<ExtArgs>
    _count?: boolean | CodeCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["code"]>

  export type CodeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    codeValue?: boolean
    sequenceNo?: boolean
    status?: boolean
    reservedAt?: boolean
    sentAt?: boolean
    createdAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["code"]>

  export type CodeSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    codeValue?: boolean
    sequenceNo?: boolean
    status?: boolean
    reservedAt?: boolean
    sentAt?: boolean
    createdAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["code"]>

  export type CodeSelectScalar = {
    id?: boolean
    productId?: boolean
    codeValue?: boolean
    sequenceNo?: boolean
    status?: boolean
    reservedAt?: boolean
    sentAt?: boolean
    createdAt?: boolean
  }

  export type CodeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "productId" | "codeValue" | "sequenceNo" | "status" | "reservedAt" | "sentAt" | "createdAt", ExtArgs["result"]["code"]>
  export type CodeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
    assignments?: boolean | Code$assignmentsArgs<ExtArgs>
    _count?: boolean | CodeCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CodeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type CodeIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $CodePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Code"
    objects: {
      product: Prisma.$ProductPayload<ExtArgs>
      assignments: Prisma.$CodeAssignmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      codeValue: string
      sequenceNo: number
      status: $Enums.CodeStatus
      reservedAt: Date | null
      sentAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["code"]>
    composites: {}
  }

  type CodeGetPayload<S extends boolean | null | undefined | CodeDefaultArgs> = $Result.GetResult<Prisma.$CodePayload, S>

  type CodeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CodeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CodeCountAggregateInputType | true
    }

  export interface CodeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Code'], meta: { name: 'Code' } }
    /**
     * Find zero or one Code that matches the filter.
     * @param {CodeFindUniqueArgs} args - Arguments to find a Code
     * @example
     * // Get one Code
     * const code = await prisma.code.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CodeFindUniqueArgs>(args: SelectSubset<T, CodeFindUniqueArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Code that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CodeFindUniqueOrThrowArgs} args - Arguments to find a Code
     * @example
     * // Get one Code
     * const code = await prisma.code.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CodeFindUniqueOrThrowArgs>(args: SelectSubset<T, CodeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Code that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeFindFirstArgs} args - Arguments to find a Code
     * @example
     * // Get one Code
     * const code = await prisma.code.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CodeFindFirstArgs>(args?: SelectSubset<T, CodeFindFirstArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Code that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeFindFirstOrThrowArgs} args - Arguments to find a Code
     * @example
     * // Get one Code
     * const code = await prisma.code.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CodeFindFirstOrThrowArgs>(args?: SelectSubset<T, CodeFindFirstOrThrowArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Codes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Codes
     * const codes = await prisma.code.findMany()
     * 
     * // Get first 10 Codes
     * const codes = await prisma.code.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const codeWithIdOnly = await prisma.code.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CodeFindManyArgs>(args?: SelectSubset<T, CodeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Code.
     * @param {CodeCreateArgs} args - Arguments to create a Code.
     * @example
     * // Create one Code
     * const Code = await prisma.code.create({
     *   data: {
     *     // ... data to create a Code
     *   }
     * })
     * 
     */
    create<T extends CodeCreateArgs>(args: SelectSubset<T, CodeCreateArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Codes.
     * @param {CodeCreateManyArgs} args - Arguments to create many Codes.
     * @example
     * // Create many Codes
     * const code = await prisma.code.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CodeCreateManyArgs>(args?: SelectSubset<T, CodeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Codes and returns the data saved in the database.
     * @param {CodeCreateManyAndReturnArgs} args - Arguments to create many Codes.
     * @example
     * // Create many Codes
     * const code = await prisma.code.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Codes and only return the `id`
     * const codeWithIdOnly = await prisma.code.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CodeCreateManyAndReturnArgs>(args?: SelectSubset<T, CodeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Code.
     * @param {CodeDeleteArgs} args - Arguments to delete one Code.
     * @example
     * // Delete one Code
     * const Code = await prisma.code.delete({
     *   where: {
     *     // ... filter to delete one Code
     *   }
     * })
     * 
     */
    delete<T extends CodeDeleteArgs>(args: SelectSubset<T, CodeDeleteArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Code.
     * @param {CodeUpdateArgs} args - Arguments to update one Code.
     * @example
     * // Update one Code
     * const code = await prisma.code.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CodeUpdateArgs>(args: SelectSubset<T, CodeUpdateArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Codes.
     * @param {CodeDeleteManyArgs} args - Arguments to filter Codes to delete.
     * @example
     * // Delete a few Codes
     * const { count } = await prisma.code.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CodeDeleteManyArgs>(args?: SelectSubset<T, CodeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Codes
     * const code = await prisma.code.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CodeUpdateManyArgs>(args: SelectSubset<T, CodeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Codes and returns the data updated in the database.
     * @param {CodeUpdateManyAndReturnArgs} args - Arguments to update many Codes.
     * @example
     * // Update many Codes
     * const code = await prisma.code.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Codes and only return the `id`
     * const codeWithIdOnly = await prisma.code.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CodeUpdateManyAndReturnArgs>(args: SelectSubset<T, CodeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Code.
     * @param {CodeUpsertArgs} args - Arguments to update or create a Code.
     * @example
     * // Update or create a Code
     * const code = await prisma.code.upsert({
     *   create: {
     *     // ... data to create a Code
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Code we want to update
     *   }
     * })
     */
    upsert<T extends CodeUpsertArgs>(args: SelectSubset<T, CodeUpsertArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeCountArgs} args - Arguments to filter Codes to count.
     * @example
     * // Count the number of Codes
     * const count = await prisma.code.count({
     *   where: {
     *     // ... the filter for the Codes we want to count
     *   }
     * })
    **/
    count<T extends CodeCountArgs>(
      args?: Subset<T, CodeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CodeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Code.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CodeAggregateArgs>(args: Subset<T, CodeAggregateArgs>): Prisma.PrismaPromise<GetCodeAggregateType<T>>

    /**
     * Group by Code.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CodeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CodeGroupByArgs['orderBy'] }
        : { orderBy?: CodeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CodeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCodeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Code model
   */
  readonly fields: CodeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Code.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CodeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    assignments<T extends Code$assignmentsArgs<ExtArgs> = {}>(args?: Subset<T, Code$assignmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Code model
   */
  interface CodeFieldRefs {
    readonly id: FieldRef<"Code", 'String'>
    readonly productId: FieldRef<"Code", 'String'>
    readonly codeValue: FieldRef<"Code", 'String'>
    readonly sequenceNo: FieldRef<"Code", 'Int'>
    readonly status: FieldRef<"Code", 'CodeStatus'>
    readonly reservedAt: FieldRef<"Code", 'DateTime'>
    readonly sentAt: FieldRef<"Code", 'DateTime'>
    readonly createdAt: FieldRef<"Code", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Code findUnique
   */
  export type CodeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeInclude<ExtArgs> | null
    /**
     * Filter, which Code to fetch.
     */
    where: CodeWhereUniqueInput
  }

  /**
   * Code findUniqueOrThrow
   */
  export type CodeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeInclude<ExtArgs> | null
    /**
     * Filter, which Code to fetch.
     */
    where: CodeWhereUniqueInput
  }

  /**
   * Code findFirst
   */
  export type CodeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeInclude<ExtArgs> | null
    /**
     * Filter, which Code to fetch.
     */
    where?: CodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codes to fetch.
     */
    orderBy?: CodeOrderByWithRelationInput | CodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Codes.
     */
    cursor?: CodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Codes.
     */
    distinct?: CodeScalarFieldEnum | CodeScalarFieldEnum[]
  }

  /**
   * Code findFirstOrThrow
   */
  export type CodeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeInclude<ExtArgs> | null
    /**
     * Filter, which Code to fetch.
     */
    where?: CodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codes to fetch.
     */
    orderBy?: CodeOrderByWithRelationInput | CodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Codes.
     */
    cursor?: CodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Codes.
     */
    distinct?: CodeScalarFieldEnum | CodeScalarFieldEnum[]
  }

  /**
   * Code findMany
   */
  export type CodeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeInclude<ExtArgs> | null
    /**
     * Filter, which Codes to fetch.
     */
    where?: CodeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Codes to fetch.
     */
    orderBy?: CodeOrderByWithRelationInput | CodeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Codes.
     */
    cursor?: CodeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Codes.
     */
    skip?: number
    distinct?: CodeScalarFieldEnum | CodeScalarFieldEnum[]
  }

  /**
   * Code create
   */
  export type CodeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeInclude<ExtArgs> | null
    /**
     * The data needed to create a Code.
     */
    data: XOR<CodeCreateInput, CodeUncheckedCreateInput>
  }

  /**
   * Code createMany
   */
  export type CodeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Codes.
     */
    data: CodeCreateManyInput | CodeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Code createManyAndReturn
   */
  export type CodeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * The data used to create many Codes.
     */
    data: CodeCreateManyInput | CodeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Code update
   */
  export type CodeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeInclude<ExtArgs> | null
    /**
     * The data needed to update a Code.
     */
    data: XOR<CodeUpdateInput, CodeUncheckedUpdateInput>
    /**
     * Choose, which Code to update.
     */
    where: CodeWhereUniqueInput
  }

  /**
   * Code updateMany
   */
  export type CodeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Codes.
     */
    data: XOR<CodeUpdateManyMutationInput, CodeUncheckedUpdateManyInput>
    /**
     * Filter which Codes to update
     */
    where?: CodeWhereInput
    /**
     * Limit how many Codes to update.
     */
    limit?: number
  }

  /**
   * Code updateManyAndReturn
   */
  export type CodeUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * The data used to update Codes.
     */
    data: XOR<CodeUpdateManyMutationInput, CodeUncheckedUpdateManyInput>
    /**
     * Filter which Codes to update
     */
    where?: CodeWhereInput
    /**
     * Limit how many Codes to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Code upsert
   */
  export type CodeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeInclude<ExtArgs> | null
    /**
     * The filter to search for the Code to update in case it exists.
     */
    where: CodeWhereUniqueInput
    /**
     * In case the Code found by the `where` argument doesn't exist, create a new Code with this data.
     */
    create: XOR<CodeCreateInput, CodeUncheckedCreateInput>
    /**
     * In case the Code was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CodeUpdateInput, CodeUncheckedUpdateInput>
  }

  /**
   * Code delete
   */
  export type CodeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeInclude<ExtArgs> | null
    /**
     * Filter which Code to delete.
     */
    where: CodeWhereUniqueInput
  }

  /**
   * Code deleteMany
   */
  export type CodeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Codes to delete
     */
    where?: CodeWhereInput
    /**
     * Limit how many Codes to delete.
     */
    limit?: number
  }

  /**
   * Code.assignments
   */
  export type Code$assignmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
    where?: CodeAssignmentWhereInput
    orderBy?: CodeAssignmentOrderByWithRelationInput | CodeAssignmentOrderByWithRelationInput[]
    cursor?: CodeAssignmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: CodeAssignmentScalarFieldEnum | CodeAssignmentScalarFieldEnum[]
  }

  /**
   * Code without action
   */
  export type CodeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Code
     */
    select?: CodeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Code
     */
    omit?: CodeOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeInclude<ExtArgs> | null
  }


  /**
   * Model Order
   */

  export type AggregateOrder = {
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  export type OrderAvgAggregateOutputType = {
    totalAmount: number | null
  }

  export type OrderSumAggregateOutputType = {
    totalAmount: number | null
  }

  export type OrderMinAggregateOutputType = {
    id: string | null
    platform: $Enums.Platform | null
    naverOrderId: string | null
    ownOrderId: string | null
    orderStatus: string | null
    ordererName: string | null
    paidAt: Date | null
    totalAmount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderMaxAggregateOutputType = {
    id: string | null
    platform: $Enums.Platform | null
    naverOrderId: string | null
    ownOrderId: string | null
    orderStatus: string | null
    ordererName: string | null
    paidAt: Date | null
    totalAmount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderCountAggregateOutputType = {
    id: number
    platform: number
    naverOrderId: number
    ownOrderId: number
    orderStatus: number
    ordererName: number
    paidAt: number
    totalAmount: number
    rawPayload: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrderAvgAggregateInputType = {
    totalAmount?: true
  }

  export type OrderSumAggregateInputType = {
    totalAmount?: true
  }

  export type OrderMinAggregateInputType = {
    id?: true
    platform?: true
    naverOrderId?: true
    ownOrderId?: true
    orderStatus?: true
    ordererName?: true
    paidAt?: true
    totalAmount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderMaxAggregateInputType = {
    id?: true
    platform?: true
    naverOrderId?: true
    ownOrderId?: true
    orderStatus?: true
    ordererName?: true
    paidAt?: true
    totalAmount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderCountAggregateInputType = {
    id?: true
    platform?: true
    naverOrderId?: true
    ownOrderId?: true
    orderStatus?: true
    ordererName?: true
    paidAt?: true
    totalAmount?: true
    rawPayload?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrderAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Order to aggregate.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Orders
    **/
    _count?: true | OrderCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderMaxAggregateInputType
  }

  export type GetOrderAggregateType<T extends OrderAggregateArgs> = {
        [P in keyof T & keyof AggregateOrder]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrder[P]>
      : GetScalarType<T[P], AggregateOrder[P]>
  }




  export type OrderGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderWhereInput
    orderBy?: OrderOrderByWithAggregationInput | OrderOrderByWithAggregationInput[]
    by: OrderScalarFieldEnum[] | OrderScalarFieldEnum
    having?: OrderScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderCountAggregateInputType | true
    _avg?: OrderAvgAggregateInputType
    _sum?: OrderSumAggregateInputType
    _min?: OrderMinAggregateInputType
    _max?: OrderMaxAggregateInputType
  }

  export type OrderGroupByOutputType = {
    id: string
    platform: $Enums.Platform
    naverOrderId: string | null
    ownOrderId: string | null
    orderStatus: string
    ordererName: string | null
    paidAt: Date | null
    totalAmount: number
    rawPayload: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: OrderCountAggregateOutputType | null
    _avg: OrderAvgAggregateOutputType | null
    _sum: OrderSumAggregateOutputType | null
    _min: OrderMinAggregateOutputType | null
    _max: OrderMaxAggregateOutputType | null
  }

  type GetOrderGroupByPayload<T extends OrderGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderGroupByOutputType[P]>
            : GetScalarType<T[P], OrderGroupByOutputType[P]>
        }
      >
    >


  export type OrderSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    platform?: boolean
    naverOrderId?: boolean
    ownOrderId?: boolean
    orderStatus?: boolean
    ordererName?: boolean
    paidAt?: boolean
    totalAmount?: boolean
    rawPayload?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    orderItems?: boolean | Order$orderItemsArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["order"]>

  export type OrderSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    platform?: boolean
    naverOrderId?: boolean
    ownOrderId?: boolean
    orderStatus?: boolean
    ordererName?: boolean
    paidAt?: boolean
    totalAmount?: boolean
    rawPayload?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["order"]>

  export type OrderSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    platform?: boolean
    naverOrderId?: boolean
    ownOrderId?: boolean
    orderStatus?: boolean
    ordererName?: boolean
    paidAt?: boolean
    totalAmount?: boolean
    rawPayload?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["order"]>

  export type OrderSelectScalar = {
    id?: boolean
    platform?: boolean
    naverOrderId?: boolean
    ownOrderId?: boolean
    orderStatus?: boolean
    ordererName?: boolean
    paidAt?: boolean
    totalAmount?: boolean
    rawPayload?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrderOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "platform" | "naverOrderId" | "ownOrderId" | "orderStatus" | "ordererName" | "paidAt" | "totalAmount" | "rawPayload" | "createdAt" | "updatedAt", ExtArgs["result"]["order"]>
  export type OrderInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItems?: boolean | Order$orderItemsArgs<ExtArgs>
    _count?: boolean | OrderCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrderIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type OrderIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $OrderPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Order"
    objects: {
      orderItems: Prisma.$OrderItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      platform: $Enums.Platform
      naverOrderId: string | null
      ownOrderId: string | null
      orderStatus: string
      ordererName: string | null
      paidAt: Date | null
      totalAmount: number
      rawPayload: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["order"]>
    composites: {}
  }

  type OrderGetPayload<S extends boolean | null | undefined | OrderDefaultArgs> = $Result.GetResult<Prisma.$OrderPayload, S>

  type OrderCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderCountAggregateInputType | true
    }

  export interface OrderDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Order'], meta: { name: 'Order' } }
    /**
     * Find zero or one Order that matches the filter.
     * @param {OrderFindUniqueArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderFindUniqueArgs>(args: SelectSubset<T, OrderFindUniqueArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Order that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderFindUniqueOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Order that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderFindFirstArgs>(args?: SelectSubset<T, OrderFindFirstArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Order that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindFirstOrThrowArgs} args - Arguments to find a Order
     * @example
     * // Get one Order
     * const order = await prisma.order.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Orders that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Orders
     * const orders = await prisma.order.findMany()
     * 
     * // Get first 10 Orders
     * const orders = await prisma.order.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderWithIdOnly = await prisma.order.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderFindManyArgs>(args?: SelectSubset<T, OrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Order.
     * @param {OrderCreateArgs} args - Arguments to create a Order.
     * @example
     * // Create one Order
     * const Order = await prisma.order.create({
     *   data: {
     *     // ... data to create a Order
     *   }
     * })
     * 
     */
    create<T extends OrderCreateArgs>(args: SelectSubset<T, OrderCreateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Orders.
     * @param {OrderCreateManyArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderCreateManyArgs>(args?: SelectSubset<T, OrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Orders and returns the data saved in the database.
     * @param {OrderCreateManyAndReturnArgs} args - Arguments to create many Orders.
     * @example
     * // Create many Orders
     * const order = await prisma.order.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Order.
     * @param {OrderDeleteArgs} args - Arguments to delete one Order.
     * @example
     * // Delete one Order
     * const Order = await prisma.order.delete({
     *   where: {
     *     // ... filter to delete one Order
     *   }
     * })
     * 
     */
    delete<T extends OrderDeleteArgs>(args: SelectSubset<T, OrderDeleteArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Order.
     * @param {OrderUpdateArgs} args - Arguments to update one Order.
     * @example
     * // Update one Order
     * const order = await prisma.order.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderUpdateArgs>(args: SelectSubset<T, OrderUpdateArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Orders.
     * @param {OrderDeleteManyArgs} args - Arguments to filter Orders to delete.
     * @example
     * // Delete a few Orders
     * const { count } = await prisma.order.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderDeleteManyArgs>(args?: SelectSubset<T, OrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderUpdateManyArgs>(args: SelectSubset<T, OrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Orders and returns the data updated in the database.
     * @param {OrderUpdateManyAndReturnArgs} args - Arguments to update many Orders.
     * @example
     * // Update many Orders
     * const order = await prisma.order.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Orders and only return the `id`
     * const orderWithIdOnly = await prisma.order.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrderUpdateManyAndReturnArgs>(args: SelectSubset<T, OrderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Order.
     * @param {OrderUpsertArgs} args - Arguments to update or create a Order.
     * @example
     * // Update or create a Order
     * const order = await prisma.order.upsert({
     *   create: {
     *     // ... data to create a Order
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Order we want to update
     *   }
     * })
     */
    upsert<T extends OrderUpsertArgs>(args: SelectSubset<T, OrderUpsertArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Orders.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderCountArgs} args - Arguments to filter Orders to count.
     * @example
     * // Count the number of Orders
     * const count = await prisma.order.count({
     *   where: {
     *     // ... the filter for the Orders we want to count
     *   }
     * })
    **/
    count<T extends OrderCountArgs>(
      args?: Subset<T, OrderCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderAggregateArgs>(args: Subset<T, OrderAggregateArgs>): Prisma.PrismaPromise<GetOrderAggregateType<T>>

    /**
     * Group by Order.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderGroupByArgs['orderBy'] }
        : { orderBy?: OrderGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Order model
   */
  readonly fields: OrderFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Order.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orderItems<T extends Order$orderItemsArgs<ExtArgs> = {}>(args?: Subset<T, Order$orderItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Order model
   */
  interface OrderFieldRefs {
    readonly id: FieldRef<"Order", 'String'>
    readonly platform: FieldRef<"Order", 'Platform'>
    readonly naverOrderId: FieldRef<"Order", 'String'>
    readonly ownOrderId: FieldRef<"Order", 'String'>
    readonly orderStatus: FieldRef<"Order", 'String'>
    readonly ordererName: FieldRef<"Order", 'String'>
    readonly paidAt: FieldRef<"Order", 'DateTime'>
    readonly totalAmount: FieldRef<"Order", 'Int'>
    readonly rawPayload: FieldRef<"Order", 'Json'>
    readonly createdAt: FieldRef<"Order", 'DateTime'>
    readonly updatedAt: FieldRef<"Order", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Order findUnique
   */
  export type OrderFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findUniqueOrThrow
   */
  export type OrderFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order findFirst
   */
  export type OrderFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findFirstOrThrow
   */
  export type OrderFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Order to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Orders.
     */
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order findMany
   */
  export type OrderFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter, which Orders to fetch.
     */
    where?: OrderWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Orders to fetch.
     */
    orderBy?: OrderOrderByWithRelationInput | OrderOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Orders.
     */
    cursor?: OrderWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Orders from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Orders.
     */
    skip?: number
    distinct?: OrderScalarFieldEnum | OrderScalarFieldEnum[]
  }

  /**
   * Order create
   */
  export type OrderCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to create a Order.
     */
    data: XOR<OrderCreateInput, OrderUncheckedCreateInput>
  }

  /**
   * Order createMany
   */
  export type OrderCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order createManyAndReturn
   */
  export type OrderCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * The data used to create many Orders.
     */
    data: OrderCreateManyInput | OrderCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Order update
   */
  export type OrderUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The data needed to update a Order.
     */
    data: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
    /**
     * Choose, which Order to update.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order updateMany
   */
  export type OrderUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to update.
     */
    limit?: number
  }

  /**
   * Order updateManyAndReturn
   */
  export type OrderUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * The data used to update Orders.
     */
    data: XOR<OrderUpdateManyMutationInput, OrderUncheckedUpdateManyInput>
    /**
     * Filter which Orders to update
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to update.
     */
    limit?: number
  }

  /**
   * Order upsert
   */
  export type OrderUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * The filter to search for the Order to update in case it exists.
     */
    where: OrderWhereUniqueInput
    /**
     * In case the Order found by the `where` argument doesn't exist, create a new Order with this data.
     */
    create: XOR<OrderCreateInput, OrderUncheckedCreateInput>
    /**
     * In case the Order was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderUpdateInput, OrderUncheckedUpdateInput>
  }

  /**
   * Order delete
   */
  export type OrderDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
    /**
     * Filter which Order to delete.
     */
    where: OrderWhereUniqueInput
  }

  /**
   * Order deleteMany
   */
  export type OrderDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Orders to delete
     */
    where?: OrderWhereInput
    /**
     * Limit how many Orders to delete.
     */
    limit?: number
  }

  /**
   * Order.orderItems
   */
  export type Order$orderItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    cursor?: OrderItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * Order without action
   */
  export type OrderDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Order
     */
    select?: OrderSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Order
     */
    omit?: OrderOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderInclude<ExtArgs> | null
  }


  /**
   * Model OrderItem
   */

  export type AggregateOrderItem = {
    _count: OrderItemCountAggregateOutputType | null
    _avg: OrderItemAvgAggregateOutputType | null
    _sum: OrderItemSumAggregateOutputType | null
    _min: OrderItemMinAggregateOutputType | null
    _max: OrderItemMaxAggregateOutputType | null
  }

  export type OrderItemAvgAggregateOutputType = {
    quantity: number | null
    unitPrice: number | null
  }

  export type OrderItemSumAggregateOutputType = {
    quantity: number | null
    unitPrice: number | null
  }

  export type OrderItemMinAggregateOutputType = {
    id: string | null
    orderId: string | null
    productId: string | null
    productOrderId: string | null
    productName: string | null
    quantity: number | null
    buyerEmail: string | null
    unitPrice: number | null
    fulfillmentStatus: $Enums.OrderItemFulfillmentStatus | null
    failureReasonCode: string | null
    failureReasonDetail: string | null
    paidAt: Date | null
    processedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderItemMaxAggregateOutputType = {
    id: string | null
    orderId: string | null
    productId: string | null
    productOrderId: string | null
    productName: string | null
    quantity: number | null
    buyerEmail: string | null
    unitPrice: number | null
    fulfillmentStatus: $Enums.OrderItemFulfillmentStatus | null
    failureReasonCode: string | null
    failureReasonDetail: string | null
    paidAt: Date | null
    processedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderItemCountAggregateOutputType = {
    id: number
    orderId: number
    productId: number
    productOrderId: number
    productName: number
    quantity: number
    buyerEmail: number
    unitPrice: number
    fulfillmentStatus: number
    failureReasonCode: number
    failureReasonDetail: number
    paidAt: number
    processedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrderItemAvgAggregateInputType = {
    quantity?: true
    unitPrice?: true
  }

  export type OrderItemSumAggregateInputType = {
    quantity?: true
    unitPrice?: true
  }

  export type OrderItemMinAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    productOrderId?: true
    productName?: true
    quantity?: true
    buyerEmail?: true
    unitPrice?: true
    fulfillmentStatus?: true
    failureReasonCode?: true
    failureReasonDetail?: true
    paidAt?: true
    processedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderItemMaxAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    productOrderId?: true
    productName?: true
    quantity?: true
    buyerEmail?: true
    unitPrice?: true
    fulfillmentStatus?: true
    failureReasonCode?: true
    failureReasonDetail?: true
    paidAt?: true
    processedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderItemCountAggregateInputType = {
    id?: true
    orderId?: true
    productId?: true
    productOrderId?: true
    productName?: true
    quantity?: true
    buyerEmail?: true
    unitPrice?: true
    fulfillmentStatus?: true
    failureReasonCode?: true
    failureReasonDetail?: true
    paidAt?: true
    processedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrderItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderItem to aggregate.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrderItems
    **/
    _count?: true | OrderItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderItemMaxAggregateInputType
  }

  export type GetOrderItemAggregateType<T extends OrderItemAggregateArgs> = {
        [P in keyof T & keyof AggregateOrderItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrderItem[P]>
      : GetScalarType<T[P], AggregateOrderItem[P]>
  }




  export type OrderItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderItemWhereInput
    orderBy?: OrderItemOrderByWithAggregationInput | OrderItemOrderByWithAggregationInput[]
    by: OrderItemScalarFieldEnum[] | OrderItemScalarFieldEnum
    having?: OrderItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderItemCountAggregateInputType | true
    _avg?: OrderItemAvgAggregateInputType
    _sum?: OrderItemSumAggregateInputType
    _min?: OrderItemMinAggregateInputType
    _max?: OrderItemMaxAggregateInputType
  }

  export type OrderItemGroupByOutputType = {
    id: string
    orderId: string
    productId: string | null
    productOrderId: string
    productName: string
    quantity: number
    buyerEmail: string | null
    unitPrice: number
    fulfillmentStatus: $Enums.OrderItemFulfillmentStatus
    failureReasonCode: string | null
    failureReasonDetail: string | null
    paidAt: Date | null
    processedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: OrderItemCountAggregateOutputType | null
    _avg: OrderItemAvgAggregateOutputType | null
    _sum: OrderItemSumAggregateOutputType | null
    _min: OrderItemMinAggregateOutputType | null
    _max: OrderItemMaxAggregateOutputType | null
  }

  type GetOrderItemGroupByPayload<T extends OrderItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderItemGroupByOutputType[P]>
            : GetScalarType<T[P], OrderItemGroupByOutputType[P]>
        }
      >
    >


  export type OrderItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    productId?: boolean
    productOrderId?: boolean
    productName?: boolean
    quantity?: boolean
    buyerEmail?: boolean
    unitPrice?: boolean
    fulfillmentStatus?: boolean
    failureReasonCode?: boolean
    failureReasonDetail?: boolean
    paidAt?: boolean
    processedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    product?: boolean | OrderItem$productArgs<ExtArgs>
    codeAssignment?: boolean | OrderItem$codeAssignmentArgs<ExtArgs>
    fulfillmentJobs?: boolean | OrderItem$fulfillmentJobsArgs<ExtArgs>
    emailLogs?: boolean | OrderItem$emailLogsArgs<ExtArgs>
    _count?: boolean | OrderItemCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderItem"]>

  export type OrderItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    productId?: boolean
    productOrderId?: boolean
    productName?: boolean
    quantity?: boolean
    buyerEmail?: boolean
    unitPrice?: boolean
    fulfillmentStatus?: boolean
    failureReasonCode?: boolean
    failureReasonDetail?: boolean
    paidAt?: boolean
    processedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    product?: boolean | OrderItem$productArgs<ExtArgs>
  }, ExtArgs["result"]["orderItem"]>

  export type OrderItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderId?: boolean
    productId?: boolean
    productOrderId?: boolean
    productName?: boolean
    quantity?: boolean
    buyerEmail?: boolean
    unitPrice?: boolean
    fulfillmentStatus?: boolean
    failureReasonCode?: boolean
    failureReasonDetail?: boolean
    paidAt?: boolean
    processedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    order?: boolean | OrderDefaultArgs<ExtArgs>
    product?: boolean | OrderItem$productArgs<ExtArgs>
  }, ExtArgs["result"]["orderItem"]>

  export type OrderItemSelectScalar = {
    id?: boolean
    orderId?: boolean
    productId?: boolean
    productOrderId?: boolean
    productName?: boolean
    quantity?: boolean
    buyerEmail?: boolean
    unitPrice?: boolean
    fulfillmentStatus?: boolean
    failureReasonCode?: boolean
    failureReasonDetail?: boolean
    paidAt?: boolean
    processedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrderItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "orderId" | "productId" | "productOrderId" | "productName" | "quantity" | "buyerEmail" | "unitPrice" | "fulfillmentStatus" | "failureReasonCode" | "failureReasonDetail" | "paidAt" | "processedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["orderItem"]>
  export type OrderItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    product?: boolean | OrderItem$productArgs<ExtArgs>
    codeAssignment?: boolean | OrderItem$codeAssignmentArgs<ExtArgs>
    fulfillmentJobs?: boolean | OrderItem$fulfillmentJobsArgs<ExtArgs>
    emailLogs?: boolean | OrderItem$emailLogsArgs<ExtArgs>
    _count?: boolean | OrderItemCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrderItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    product?: boolean | OrderItem$productArgs<ExtArgs>
  }
  export type OrderItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    order?: boolean | OrderDefaultArgs<ExtArgs>
    product?: boolean | OrderItem$productArgs<ExtArgs>
  }

  export type $OrderItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrderItem"
    objects: {
      order: Prisma.$OrderPayload<ExtArgs>
      product: Prisma.$ProductPayload<ExtArgs> | null
      codeAssignment: Prisma.$CodeAssignmentPayload<ExtArgs> | null
      fulfillmentJobs: Prisma.$FulfillmentJobPayload<ExtArgs>[]
      emailLogs: Prisma.$EmailLogPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderId: string
      productId: string | null
      productOrderId: string
      productName: string
      quantity: number
      buyerEmail: string | null
      unitPrice: number
      fulfillmentStatus: $Enums.OrderItemFulfillmentStatus
      failureReasonCode: string | null
      failureReasonDetail: string | null
      paidAt: Date | null
      processedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["orderItem"]>
    composites: {}
  }

  type OrderItemGetPayload<S extends boolean | null | undefined | OrderItemDefaultArgs> = $Result.GetResult<Prisma.$OrderItemPayload, S>

  type OrderItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderItemCountAggregateInputType | true
    }

  export interface OrderItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrderItem'], meta: { name: 'OrderItem' } }
    /**
     * Find zero or one OrderItem that matches the filter.
     * @param {OrderItemFindUniqueArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderItemFindUniqueArgs>(args: SelectSubset<T, OrderItemFindUniqueArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrderItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderItemFindUniqueOrThrowArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderItemFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrderItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindFirstArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderItemFindFirstArgs>(args?: SelectSubset<T, OrderItemFindFirstArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrderItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindFirstOrThrowArgs} args - Arguments to find a OrderItem
     * @example
     * // Get one OrderItem
     * const orderItem = await prisma.orderItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderItemFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrderItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrderItems
     * const orderItems = await prisma.orderItem.findMany()
     * 
     * // Get first 10 OrderItems
     * const orderItems = await prisma.orderItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderItemWithIdOnly = await prisma.orderItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderItemFindManyArgs>(args?: SelectSubset<T, OrderItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrderItem.
     * @param {OrderItemCreateArgs} args - Arguments to create a OrderItem.
     * @example
     * // Create one OrderItem
     * const OrderItem = await prisma.orderItem.create({
     *   data: {
     *     // ... data to create a OrderItem
     *   }
     * })
     * 
     */
    create<T extends OrderItemCreateArgs>(args: SelectSubset<T, OrderItemCreateArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrderItems.
     * @param {OrderItemCreateManyArgs} args - Arguments to create many OrderItems.
     * @example
     * // Create many OrderItems
     * const orderItem = await prisma.orderItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderItemCreateManyArgs>(args?: SelectSubset<T, OrderItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrderItems and returns the data saved in the database.
     * @param {OrderItemCreateManyAndReturnArgs} args - Arguments to create many OrderItems.
     * @example
     * // Create many OrderItems
     * const orderItem = await prisma.orderItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrderItems and only return the `id`
     * const orderItemWithIdOnly = await prisma.orderItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderItemCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrderItem.
     * @param {OrderItemDeleteArgs} args - Arguments to delete one OrderItem.
     * @example
     * // Delete one OrderItem
     * const OrderItem = await prisma.orderItem.delete({
     *   where: {
     *     // ... filter to delete one OrderItem
     *   }
     * })
     * 
     */
    delete<T extends OrderItemDeleteArgs>(args: SelectSubset<T, OrderItemDeleteArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrderItem.
     * @param {OrderItemUpdateArgs} args - Arguments to update one OrderItem.
     * @example
     * // Update one OrderItem
     * const orderItem = await prisma.orderItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderItemUpdateArgs>(args: SelectSubset<T, OrderItemUpdateArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrderItems.
     * @param {OrderItemDeleteManyArgs} args - Arguments to filter OrderItems to delete.
     * @example
     * // Delete a few OrderItems
     * const { count } = await prisma.orderItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderItemDeleteManyArgs>(args?: SelectSubset<T, OrderItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrderItems
     * const orderItem = await prisma.orderItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderItemUpdateManyArgs>(args: SelectSubset<T, OrderItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderItems and returns the data updated in the database.
     * @param {OrderItemUpdateManyAndReturnArgs} args - Arguments to update many OrderItems.
     * @example
     * // Update many OrderItems
     * const orderItem = await prisma.orderItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrderItems and only return the `id`
     * const orderItemWithIdOnly = await prisma.orderItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrderItemUpdateManyAndReturnArgs>(args: SelectSubset<T, OrderItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrderItem.
     * @param {OrderItemUpsertArgs} args - Arguments to update or create a OrderItem.
     * @example
     * // Update or create a OrderItem
     * const orderItem = await prisma.orderItem.upsert({
     *   create: {
     *     // ... data to create a OrderItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrderItem we want to update
     *   }
     * })
     */
    upsert<T extends OrderItemUpsertArgs>(args: SelectSubset<T, OrderItemUpsertArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrderItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemCountArgs} args - Arguments to filter OrderItems to count.
     * @example
     * // Count the number of OrderItems
     * const count = await prisma.orderItem.count({
     *   where: {
     *     // ... the filter for the OrderItems we want to count
     *   }
     * })
    **/
    count<T extends OrderItemCountArgs>(
      args?: Subset<T, OrderItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrderItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrderItemAggregateArgs>(args: Subset<T, OrderItemAggregateArgs>): Prisma.PrismaPromise<GetOrderItemAggregateType<T>>

    /**
     * Group by OrderItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrderItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderItemGroupByArgs['orderBy'] }
        : { orderBy?: OrderItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrderItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrderItem model
   */
  readonly fields: OrderItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrderItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    order<T extends OrderDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderDefaultArgs<ExtArgs>>): Prisma__OrderClient<$Result.GetResult<Prisma.$OrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    product<T extends OrderItem$productArgs<ExtArgs> = {}>(args?: Subset<T, OrderItem$productArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    codeAssignment<T extends OrderItem$codeAssignmentArgs<ExtArgs> = {}>(args?: Subset<T, OrderItem$codeAssignmentArgs<ExtArgs>>): Prisma__CodeAssignmentClient<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    fulfillmentJobs<T extends OrderItem$fulfillmentJobsArgs<ExtArgs> = {}>(args?: Subset<T, OrderItem$fulfillmentJobsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    emailLogs<T extends OrderItem$emailLogsArgs<ExtArgs> = {}>(args?: Subset<T, OrderItem$emailLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the OrderItem model
   */
  interface OrderItemFieldRefs {
    readonly id: FieldRef<"OrderItem", 'String'>
    readonly orderId: FieldRef<"OrderItem", 'String'>
    readonly productId: FieldRef<"OrderItem", 'String'>
    readonly productOrderId: FieldRef<"OrderItem", 'String'>
    readonly productName: FieldRef<"OrderItem", 'String'>
    readonly quantity: FieldRef<"OrderItem", 'Int'>
    readonly buyerEmail: FieldRef<"OrderItem", 'String'>
    readonly unitPrice: FieldRef<"OrderItem", 'Int'>
    readonly fulfillmentStatus: FieldRef<"OrderItem", 'OrderItemFulfillmentStatus'>
    readonly failureReasonCode: FieldRef<"OrderItem", 'String'>
    readonly failureReasonDetail: FieldRef<"OrderItem", 'String'>
    readonly paidAt: FieldRef<"OrderItem", 'DateTime'>
    readonly processedAt: FieldRef<"OrderItem", 'DateTime'>
    readonly createdAt: FieldRef<"OrderItem", 'DateTime'>
    readonly updatedAt: FieldRef<"OrderItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrderItem findUnique
   */
  export type OrderItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem findUniqueOrThrow
   */
  export type OrderItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem findFirst
   */
  export type OrderItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderItems.
     */
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem findFirstOrThrow
   */
  export type OrderItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItem to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderItems.
     */
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem findMany
   */
  export type OrderItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderItems to fetch.
     */
    where?: OrderItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderItems to fetch.
     */
    orderBy?: OrderItemOrderByWithRelationInput | OrderItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrderItems.
     */
    cursor?: OrderItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderItems.
     */
    skip?: number
    distinct?: OrderItemScalarFieldEnum | OrderItemScalarFieldEnum[]
  }

  /**
   * OrderItem create
   */
  export type OrderItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The data needed to create a OrderItem.
     */
    data: XOR<OrderItemCreateInput, OrderItemUncheckedCreateInput>
  }

  /**
   * OrderItem createMany
   */
  export type OrderItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrderItems.
     */
    data: OrderItemCreateManyInput | OrderItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrderItem createManyAndReturn
   */
  export type OrderItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * The data used to create many OrderItems.
     */
    data: OrderItemCreateManyInput | OrderItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderItem update
   */
  export type OrderItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The data needed to update a OrderItem.
     */
    data: XOR<OrderItemUpdateInput, OrderItemUncheckedUpdateInput>
    /**
     * Choose, which OrderItem to update.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem updateMany
   */
  export type OrderItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrderItems.
     */
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyInput>
    /**
     * Filter which OrderItems to update
     */
    where?: OrderItemWhereInput
    /**
     * Limit how many OrderItems to update.
     */
    limit?: number
  }

  /**
   * OrderItem updateManyAndReturn
   */
  export type OrderItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * The data used to update OrderItems.
     */
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyInput>
    /**
     * Filter which OrderItems to update
     */
    where?: OrderItemWhereInput
    /**
     * Limit how many OrderItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderItem upsert
   */
  export type OrderItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * The filter to search for the OrderItem to update in case it exists.
     */
    where: OrderItemWhereUniqueInput
    /**
     * In case the OrderItem found by the `where` argument doesn't exist, create a new OrderItem with this data.
     */
    create: XOR<OrderItemCreateInput, OrderItemUncheckedCreateInput>
    /**
     * In case the OrderItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderItemUpdateInput, OrderItemUncheckedUpdateInput>
  }

  /**
   * OrderItem delete
   */
  export type OrderItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
    /**
     * Filter which OrderItem to delete.
     */
    where: OrderItemWhereUniqueInput
  }

  /**
   * OrderItem deleteMany
   */
  export type OrderItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderItems to delete
     */
    where?: OrderItemWhereInput
    /**
     * Limit how many OrderItems to delete.
     */
    limit?: number
  }

  /**
   * OrderItem.product
   */
  export type OrderItem$productArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
  }

  /**
   * OrderItem.codeAssignment
   */
  export type OrderItem$codeAssignmentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
    where?: CodeAssignmentWhereInput
  }

  /**
   * OrderItem.fulfillmentJobs
   */
  export type OrderItem$fulfillmentJobsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobInclude<ExtArgs> | null
    where?: FulfillmentJobWhereInput
    orderBy?: FulfillmentJobOrderByWithRelationInput | FulfillmentJobOrderByWithRelationInput[]
    cursor?: FulfillmentJobWhereUniqueInput
    take?: number
    skip?: number
    distinct?: FulfillmentJobScalarFieldEnum | FulfillmentJobScalarFieldEnum[]
  }

  /**
   * OrderItem.emailLogs
   */
  export type OrderItem$emailLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogInclude<ExtArgs> | null
    where?: EmailLogWhereInput
    orderBy?: EmailLogOrderByWithRelationInput | EmailLogOrderByWithRelationInput[]
    cursor?: EmailLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: EmailLogScalarFieldEnum | EmailLogScalarFieldEnum[]
  }

  /**
   * OrderItem without action
   */
  export type OrderItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderItem
     */
    select?: OrderItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderItem
     */
    omit?: OrderItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderItemInclude<ExtArgs> | null
  }


  /**
   * Model CodeAssignment
   */

  export type AggregateCodeAssignment = {
    _count: CodeAssignmentCountAggregateOutputType | null
    _min: CodeAssignmentMinAggregateOutputType | null
    _max: CodeAssignmentMaxAggregateOutputType | null
  }

  export type CodeAssignmentMinAggregateOutputType = {
    id: string | null
    orderItemId: string | null
    codeId: string | null
    status: $Enums.CodeAssignmentStatus | null
    assignedAt: Date | null
    sentAt: Date | null
  }

  export type CodeAssignmentMaxAggregateOutputType = {
    id: string | null
    orderItemId: string | null
    codeId: string | null
    status: $Enums.CodeAssignmentStatus | null
    assignedAt: Date | null
    sentAt: Date | null
  }

  export type CodeAssignmentCountAggregateOutputType = {
    id: number
    orderItemId: number
    codeId: number
    status: number
    assignedAt: number
    sentAt: number
    _all: number
  }


  export type CodeAssignmentMinAggregateInputType = {
    id?: true
    orderItemId?: true
    codeId?: true
    status?: true
    assignedAt?: true
    sentAt?: true
  }

  export type CodeAssignmentMaxAggregateInputType = {
    id?: true
    orderItemId?: true
    codeId?: true
    status?: true
    assignedAt?: true
    sentAt?: true
  }

  export type CodeAssignmentCountAggregateInputType = {
    id?: true
    orderItemId?: true
    codeId?: true
    status?: true
    assignedAt?: true
    sentAt?: true
    _all?: true
  }

  export type CodeAssignmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CodeAssignment to aggregate.
     */
    where?: CodeAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodeAssignments to fetch.
     */
    orderBy?: CodeAssignmentOrderByWithRelationInput | CodeAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CodeAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodeAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodeAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CodeAssignments
    **/
    _count?: true | CodeAssignmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CodeAssignmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CodeAssignmentMaxAggregateInputType
  }

  export type GetCodeAssignmentAggregateType<T extends CodeAssignmentAggregateArgs> = {
        [P in keyof T & keyof AggregateCodeAssignment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCodeAssignment[P]>
      : GetScalarType<T[P], AggregateCodeAssignment[P]>
  }




  export type CodeAssignmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CodeAssignmentWhereInput
    orderBy?: CodeAssignmentOrderByWithAggregationInput | CodeAssignmentOrderByWithAggregationInput[]
    by: CodeAssignmentScalarFieldEnum[] | CodeAssignmentScalarFieldEnum
    having?: CodeAssignmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CodeAssignmentCountAggregateInputType | true
    _min?: CodeAssignmentMinAggregateInputType
    _max?: CodeAssignmentMaxAggregateInputType
  }

  export type CodeAssignmentGroupByOutputType = {
    id: string
    orderItemId: string
    codeId: string
    status: $Enums.CodeAssignmentStatus
    assignedAt: Date
    sentAt: Date | null
    _count: CodeAssignmentCountAggregateOutputType | null
    _min: CodeAssignmentMinAggregateOutputType | null
    _max: CodeAssignmentMaxAggregateOutputType | null
  }

  type GetCodeAssignmentGroupByPayload<T extends CodeAssignmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CodeAssignmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CodeAssignmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CodeAssignmentGroupByOutputType[P]>
            : GetScalarType<T[P], CodeAssignmentGroupByOutputType[P]>
        }
      >
    >


  export type CodeAssignmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderItemId?: boolean
    codeId?: boolean
    status?: boolean
    assignedAt?: boolean
    sentAt?: boolean
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
    code?: boolean | CodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["codeAssignment"]>

  export type CodeAssignmentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderItemId?: boolean
    codeId?: boolean
    status?: boolean
    assignedAt?: boolean
    sentAt?: boolean
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
    code?: boolean | CodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["codeAssignment"]>

  export type CodeAssignmentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderItemId?: boolean
    codeId?: boolean
    status?: boolean
    assignedAt?: boolean
    sentAt?: boolean
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
    code?: boolean | CodeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["codeAssignment"]>

  export type CodeAssignmentSelectScalar = {
    id?: boolean
    orderItemId?: boolean
    codeId?: boolean
    status?: boolean
    assignedAt?: boolean
    sentAt?: boolean
  }

  export type CodeAssignmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "orderItemId" | "codeId" | "status" | "assignedAt" | "sentAt", ExtArgs["result"]["codeAssignment"]>
  export type CodeAssignmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
    code?: boolean | CodeDefaultArgs<ExtArgs>
  }
  export type CodeAssignmentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
    code?: boolean | CodeDefaultArgs<ExtArgs>
  }
  export type CodeAssignmentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
    code?: boolean | CodeDefaultArgs<ExtArgs>
  }

  export type $CodeAssignmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CodeAssignment"
    objects: {
      orderItem: Prisma.$OrderItemPayload<ExtArgs>
      code: Prisma.$CodePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderItemId: string
      codeId: string
      status: $Enums.CodeAssignmentStatus
      assignedAt: Date
      sentAt: Date | null
    }, ExtArgs["result"]["codeAssignment"]>
    composites: {}
  }

  type CodeAssignmentGetPayload<S extends boolean | null | undefined | CodeAssignmentDefaultArgs> = $Result.GetResult<Prisma.$CodeAssignmentPayload, S>

  type CodeAssignmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<CodeAssignmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CodeAssignmentCountAggregateInputType | true
    }

  export interface CodeAssignmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CodeAssignment'], meta: { name: 'CodeAssignment' } }
    /**
     * Find zero or one CodeAssignment that matches the filter.
     * @param {CodeAssignmentFindUniqueArgs} args - Arguments to find a CodeAssignment
     * @example
     * // Get one CodeAssignment
     * const codeAssignment = await prisma.codeAssignment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CodeAssignmentFindUniqueArgs>(args: SelectSubset<T, CodeAssignmentFindUniqueArgs<ExtArgs>>): Prisma__CodeAssignmentClient<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one CodeAssignment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CodeAssignmentFindUniqueOrThrowArgs} args - Arguments to find a CodeAssignment
     * @example
     * // Get one CodeAssignment
     * const codeAssignment = await prisma.codeAssignment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CodeAssignmentFindUniqueOrThrowArgs>(args: SelectSubset<T, CodeAssignmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CodeAssignmentClient<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CodeAssignment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeAssignmentFindFirstArgs} args - Arguments to find a CodeAssignment
     * @example
     * // Get one CodeAssignment
     * const codeAssignment = await prisma.codeAssignment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CodeAssignmentFindFirstArgs>(args?: SelectSubset<T, CodeAssignmentFindFirstArgs<ExtArgs>>): Prisma__CodeAssignmentClient<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first CodeAssignment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeAssignmentFindFirstOrThrowArgs} args - Arguments to find a CodeAssignment
     * @example
     * // Get one CodeAssignment
     * const codeAssignment = await prisma.codeAssignment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CodeAssignmentFindFirstOrThrowArgs>(args?: SelectSubset<T, CodeAssignmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__CodeAssignmentClient<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more CodeAssignments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeAssignmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CodeAssignments
     * const codeAssignments = await prisma.codeAssignment.findMany()
     * 
     * // Get first 10 CodeAssignments
     * const codeAssignments = await prisma.codeAssignment.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const codeAssignmentWithIdOnly = await prisma.codeAssignment.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CodeAssignmentFindManyArgs>(args?: SelectSubset<T, CodeAssignmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a CodeAssignment.
     * @param {CodeAssignmentCreateArgs} args - Arguments to create a CodeAssignment.
     * @example
     * // Create one CodeAssignment
     * const CodeAssignment = await prisma.codeAssignment.create({
     *   data: {
     *     // ... data to create a CodeAssignment
     *   }
     * })
     * 
     */
    create<T extends CodeAssignmentCreateArgs>(args: SelectSubset<T, CodeAssignmentCreateArgs<ExtArgs>>): Prisma__CodeAssignmentClient<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many CodeAssignments.
     * @param {CodeAssignmentCreateManyArgs} args - Arguments to create many CodeAssignments.
     * @example
     * // Create many CodeAssignments
     * const codeAssignment = await prisma.codeAssignment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CodeAssignmentCreateManyArgs>(args?: SelectSubset<T, CodeAssignmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CodeAssignments and returns the data saved in the database.
     * @param {CodeAssignmentCreateManyAndReturnArgs} args - Arguments to create many CodeAssignments.
     * @example
     * // Create many CodeAssignments
     * const codeAssignment = await prisma.codeAssignment.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CodeAssignments and only return the `id`
     * const codeAssignmentWithIdOnly = await prisma.codeAssignment.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CodeAssignmentCreateManyAndReturnArgs>(args?: SelectSubset<T, CodeAssignmentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a CodeAssignment.
     * @param {CodeAssignmentDeleteArgs} args - Arguments to delete one CodeAssignment.
     * @example
     * // Delete one CodeAssignment
     * const CodeAssignment = await prisma.codeAssignment.delete({
     *   where: {
     *     // ... filter to delete one CodeAssignment
     *   }
     * })
     * 
     */
    delete<T extends CodeAssignmentDeleteArgs>(args: SelectSubset<T, CodeAssignmentDeleteArgs<ExtArgs>>): Prisma__CodeAssignmentClient<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one CodeAssignment.
     * @param {CodeAssignmentUpdateArgs} args - Arguments to update one CodeAssignment.
     * @example
     * // Update one CodeAssignment
     * const codeAssignment = await prisma.codeAssignment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CodeAssignmentUpdateArgs>(args: SelectSubset<T, CodeAssignmentUpdateArgs<ExtArgs>>): Prisma__CodeAssignmentClient<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more CodeAssignments.
     * @param {CodeAssignmentDeleteManyArgs} args - Arguments to filter CodeAssignments to delete.
     * @example
     * // Delete a few CodeAssignments
     * const { count } = await prisma.codeAssignment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CodeAssignmentDeleteManyArgs>(args?: SelectSubset<T, CodeAssignmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CodeAssignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeAssignmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CodeAssignments
     * const codeAssignment = await prisma.codeAssignment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CodeAssignmentUpdateManyArgs>(args: SelectSubset<T, CodeAssignmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CodeAssignments and returns the data updated in the database.
     * @param {CodeAssignmentUpdateManyAndReturnArgs} args - Arguments to update many CodeAssignments.
     * @example
     * // Update many CodeAssignments
     * const codeAssignment = await prisma.codeAssignment.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more CodeAssignments and only return the `id`
     * const codeAssignmentWithIdOnly = await prisma.codeAssignment.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends CodeAssignmentUpdateManyAndReturnArgs>(args: SelectSubset<T, CodeAssignmentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one CodeAssignment.
     * @param {CodeAssignmentUpsertArgs} args - Arguments to update or create a CodeAssignment.
     * @example
     * // Update or create a CodeAssignment
     * const codeAssignment = await prisma.codeAssignment.upsert({
     *   create: {
     *     // ... data to create a CodeAssignment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CodeAssignment we want to update
     *   }
     * })
     */
    upsert<T extends CodeAssignmentUpsertArgs>(args: SelectSubset<T, CodeAssignmentUpsertArgs<ExtArgs>>): Prisma__CodeAssignmentClient<$Result.GetResult<Prisma.$CodeAssignmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of CodeAssignments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeAssignmentCountArgs} args - Arguments to filter CodeAssignments to count.
     * @example
     * // Count the number of CodeAssignments
     * const count = await prisma.codeAssignment.count({
     *   where: {
     *     // ... the filter for the CodeAssignments we want to count
     *   }
     * })
    **/
    count<T extends CodeAssignmentCountArgs>(
      args?: Subset<T, CodeAssignmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CodeAssignmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CodeAssignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeAssignmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CodeAssignmentAggregateArgs>(args: Subset<T, CodeAssignmentAggregateArgs>): Prisma.PrismaPromise<GetCodeAssignmentAggregateType<T>>

    /**
     * Group by CodeAssignment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CodeAssignmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CodeAssignmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CodeAssignmentGroupByArgs['orderBy'] }
        : { orderBy?: CodeAssignmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CodeAssignmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCodeAssignmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CodeAssignment model
   */
  readonly fields: CodeAssignmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CodeAssignment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CodeAssignmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orderItem<T extends OrderItemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderItemDefaultArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    code<T extends CodeDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CodeDefaultArgs<ExtArgs>>): Prisma__CodeClient<$Result.GetResult<Prisma.$CodePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CodeAssignment model
   */
  interface CodeAssignmentFieldRefs {
    readonly id: FieldRef<"CodeAssignment", 'String'>
    readonly orderItemId: FieldRef<"CodeAssignment", 'String'>
    readonly codeId: FieldRef<"CodeAssignment", 'String'>
    readonly status: FieldRef<"CodeAssignment", 'CodeAssignmentStatus'>
    readonly assignedAt: FieldRef<"CodeAssignment", 'DateTime'>
    readonly sentAt: FieldRef<"CodeAssignment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CodeAssignment findUnique
   */
  export type CodeAssignmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which CodeAssignment to fetch.
     */
    where: CodeAssignmentWhereUniqueInput
  }

  /**
   * CodeAssignment findUniqueOrThrow
   */
  export type CodeAssignmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which CodeAssignment to fetch.
     */
    where: CodeAssignmentWhereUniqueInput
  }

  /**
   * CodeAssignment findFirst
   */
  export type CodeAssignmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which CodeAssignment to fetch.
     */
    where?: CodeAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodeAssignments to fetch.
     */
    orderBy?: CodeAssignmentOrderByWithRelationInput | CodeAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CodeAssignments.
     */
    cursor?: CodeAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodeAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodeAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CodeAssignments.
     */
    distinct?: CodeAssignmentScalarFieldEnum | CodeAssignmentScalarFieldEnum[]
  }

  /**
   * CodeAssignment findFirstOrThrow
   */
  export type CodeAssignmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which CodeAssignment to fetch.
     */
    where?: CodeAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodeAssignments to fetch.
     */
    orderBy?: CodeAssignmentOrderByWithRelationInput | CodeAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CodeAssignments.
     */
    cursor?: CodeAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodeAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodeAssignments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CodeAssignments.
     */
    distinct?: CodeAssignmentScalarFieldEnum | CodeAssignmentScalarFieldEnum[]
  }

  /**
   * CodeAssignment findMany
   */
  export type CodeAssignmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
    /**
     * Filter, which CodeAssignments to fetch.
     */
    where?: CodeAssignmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CodeAssignments to fetch.
     */
    orderBy?: CodeAssignmentOrderByWithRelationInput | CodeAssignmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CodeAssignments.
     */
    cursor?: CodeAssignmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CodeAssignments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CodeAssignments.
     */
    skip?: number
    distinct?: CodeAssignmentScalarFieldEnum | CodeAssignmentScalarFieldEnum[]
  }

  /**
   * CodeAssignment create
   */
  export type CodeAssignmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
    /**
     * The data needed to create a CodeAssignment.
     */
    data: XOR<CodeAssignmentCreateInput, CodeAssignmentUncheckedCreateInput>
  }

  /**
   * CodeAssignment createMany
   */
  export type CodeAssignmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CodeAssignments.
     */
    data: CodeAssignmentCreateManyInput | CodeAssignmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CodeAssignment createManyAndReturn
   */
  export type CodeAssignmentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * The data used to create many CodeAssignments.
     */
    data: CodeAssignmentCreateManyInput | CodeAssignmentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * CodeAssignment update
   */
  export type CodeAssignmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
    /**
     * The data needed to update a CodeAssignment.
     */
    data: XOR<CodeAssignmentUpdateInput, CodeAssignmentUncheckedUpdateInput>
    /**
     * Choose, which CodeAssignment to update.
     */
    where: CodeAssignmentWhereUniqueInput
  }

  /**
   * CodeAssignment updateMany
   */
  export type CodeAssignmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CodeAssignments.
     */
    data: XOR<CodeAssignmentUpdateManyMutationInput, CodeAssignmentUncheckedUpdateManyInput>
    /**
     * Filter which CodeAssignments to update
     */
    where?: CodeAssignmentWhereInput
    /**
     * Limit how many CodeAssignments to update.
     */
    limit?: number
  }

  /**
   * CodeAssignment updateManyAndReturn
   */
  export type CodeAssignmentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * The data used to update CodeAssignments.
     */
    data: XOR<CodeAssignmentUpdateManyMutationInput, CodeAssignmentUncheckedUpdateManyInput>
    /**
     * Filter which CodeAssignments to update
     */
    where?: CodeAssignmentWhereInput
    /**
     * Limit how many CodeAssignments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * CodeAssignment upsert
   */
  export type CodeAssignmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
    /**
     * The filter to search for the CodeAssignment to update in case it exists.
     */
    where: CodeAssignmentWhereUniqueInput
    /**
     * In case the CodeAssignment found by the `where` argument doesn't exist, create a new CodeAssignment with this data.
     */
    create: XOR<CodeAssignmentCreateInput, CodeAssignmentUncheckedCreateInput>
    /**
     * In case the CodeAssignment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CodeAssignmentUpdateInput, CodeAssignmentUncheckedUpdateInput>
  }

  /**
   * CodeAssignment delete
   */
  export type CodeAssignmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
    /**
     * Filter which CodeAssignment to delete.
     */
    where: CodeAssignmentWhereUniqueInput
  }

  /**
   * CodeAssignment deleteMany
   */
  export type CodeAssignmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CodeAssignments to delete
     */
    where?: CodeAssignmentWhereInput
    /**
     * Limit how many CodeAssignments to delete.
     */
    limit?: number
  }

  /**
   * CodeAssignment without action
   */
  export type CodeAssignmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CodeAssignment
     */
    select?: CodeAssignmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the CodeAssignment
     */
    omit?: CodeAssignmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CodeAssignmentInclude<ExtArgs> | null
  }


  /**
   * Model FulfillmentJob
   */

  export type AggregateFulfillmentJob = {
    _count: FulfillmentJobCountAggregateOutputType | null
    _avg: FulfillmentJobAvgAggregateOutputType | null
    _sum: FulfillmentJobSumAggregateOutputType | null
    _min: FulfillmentJobMinAggregateOutputType | null
    _max: FulfillmentJobMaxAggregateOutputType | null
  }

  export type FulfillmentJobAvgAggregateOutputType = {
    retryCount: number | null
  }

  export type FulfillmentJobSumAggregateOutputType = {
    retryCount: number | null
  }

  export type FulfillmentJobMinAggregateOutputType = {
    id: string | null
    orderItemId: string | null
    jobType: string | null
    status: $Enums.FulfillmentJobStatus | null
    retryCount: number | null
    errorMessage: string | null
    processedAt: Date | null
    createdAt: Date | null
  }

  export type FulfillmentJobMaxAggregateOutputType = {
    id: string | null
    orderItemId: string | null
    jobType: string | null
    status: $Enums.FulfillmentJobStatus | null
    retryCount: number | null
    errorMessage: string | null
    processedAt: Date | null
    createdAt: Date | null
  }

  export type FulfillmentJobCountAggregateOutputType = {
    id: number
    orderItemId: number
    jobType: number
    status: number
    retryCount: number
    errorMessage: number
    context: number
    processedAt: number
    createdAt: number
    _all: number
  }


  export type FulfillmentJobAvgAggregateInputType = {
    retryCount?: true
  }

  export type FulfillmentJobSumAggregateInputType = {
    retryCount?: true
  }

  export type FulfillmentJobMinAggregateInputType = {
    id?: true
    orderItemId?: true
    jobType?: true
    status?: true
    retryCount?: true
    errorMessage?: true
    processedAt?: true
    createdAt?: true
  }

  export type FulfillmentJobMaxAggregateInputType = {
    id?: true
    orderItemId?: true
    jobType?: true
    status?: true
    retryCount?: true
    errorMessage?: true
    processedAt?: true
    createdAt?: true
  }

  export type FulfillmentJobCountAggregateInputType = {
    id?: true
    orderItemId?: true
    jobType?: true
    status?: true
    retryCount?: true
    errorMessage?: true
    context?: true
    processedAt?: true
    createdAt?: true
    _all?: true
  }

  export type FulfillmentJobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FulfillmentJob to aggregate.
     */
    where?: FulfillmentJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FulfillmentJobs to fetch.
     */
    orderBy?: FulfillmentJobOrderByWithRelationInput | FulfillmentJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: FulfillmentJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FulfillmentJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FulfillmentJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned FulfillmentJobs
    **/
    _count?: true | FulfillmentJobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: FulfillmentJobAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: FulfillmentJobSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: FulfillmentJobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: FulfillmentJobMaxAggregateInputType
  }

  export type GetFulfillmentJobAggregateType<T extends FulfillmentJobAggregateArgs> = {
        [P in keyof T & keyof AggregateFulfillmentJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateFulfillmentJob[P]>
      : GetScalarType<T[P], AggregateFulfillmentJob[P]>
  }




  export type FulfillmentJobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: FulfillmentJobWhereInput
    orderBy?: FulfillmentJobOrderByWithAggregationInput | FulfillmentJobOrderByWithAggregationInput[]
    by: FulfillmentJobScalarFieldEnum[] | FulfillmentJobScalarFieldEnum
    having?: FulfillmentJobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: FulfillmentJobCountAggregateInputType | true
    _avg?: FulfillmentJobAvgAggregateInputType
    _sum?: FulfillmentJobSumAggregateInputType
    _min?: FulfillmentJobMinAggregateInputType
    _max?: FulfillmentJobMaxAggregateInputType
  }

  export type FulfillmentJobGroupByOutputType = {
    id: string
    orderItemId: string
    jobType: string
    status: $Enums.FulfillmentJobStatus
    retryCount: number
    errorMessage: string | null
    context: JsonValue | null
    processedAt: Date | null
    createdAt: Date
    _count: FulfillmentJobCountAggregateOutputType | null
    _avg: FulfillmentJobAvgAggregateOutputType | null
    _sum: FulfillmentJobSumAggregateOutputType | null
    _min: FulfillmentJobMinAggregateOutputType | null
    _max: FulfillmentJobMaxAggregateOutputType | null
  }

  type GetFulfillmentJobGroupByPayload<T extends FulfillmentJobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<FulfillmentJobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof FulfillmentJobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], FulfillmentJobGroupByOutputType[P]>
            : GetScalarType<T[P], FulfillmentJobGroupByOutputType[P]>
        }
      >
    >


  export type FulfillmentJobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderItemId?: boolean
    jobType?: boolean
    status?: boolean
    retryCount?: boolean
    errorMessage?: boolean
    context?: boolean
    processedAt?: boolean
    createdAt?: boolean
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fulfillmentJob"]>

  export type FulfillmentJobSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderItemId?: boolean
    jobType?: boolean
    status?: boolean
    retryCount?: boolean
    errorMessage?: boolean
    context?: boolean
    processedAt?: boolean
    createdAt?: boolean
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fulfillmentJob"]>

  export type FulfillmentJobSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderItemId?: boolean
    jobType?: boolean
    status?: boolean
    retryCount?: boolean
    errorMessage?: boolean
    context?: boolean
    processedAt?: boolean
    createdAt?: boolean
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["fulfillmentJob"]>

  export type FulfillmentJobSelectScalar = {
    id?: boolean
    orderItemId?: boolean
    jobType?: boolean
    status?: boolean
    retryCount?: boolean
    errorMessage?: boolean
    context?: boolean
    processedAt?: boolean
    createdAt?: boolean
  }

  export type FulfillmentJobOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "orderItemId" | "jobType" | "status" | "retryCount" | "errorMessage" | "context" | "processedAt" | "createdAt", ExtArgs["result"]["fulfillmentJob"]>
  export type FulfillmentJobInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }
  export type FulfillmentJobIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }
  export type FulfillmentJobIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }

  export type $FulfillmentJobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "FulfillmentJob"
    objects: {
      orderItem: Prisma.$OrderItemPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderItemId: string
      jobType: string
      status: $Enums.FulfillmentJobStatus
      retryCount: number
      errorMessage: string | null
      context: Prisma.JsonValue | null
      processedAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["fulfillmentJob"]>
    composites: {}
  }

  type FulfillmentJobGetPayload<S extends boolean | null | undefined | FulfillmentJobDefaultArgs> = $Result.GetResult<Prisma.$FulfillmentJobPayload, S>

  type FulfillmentJobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<FulfillmentJobFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: FulfillmentJobCountAggregateInputType | true
    }

  export interface FulfillmentJobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['FulfillmentJob'], meta: { name: 'FulfillmentJob' } }
    /**
     * Find zero or one FulfillmentJob that matches the filter.
     * @param {FulfillmentJobFindUniqueArgs} args - Arguments to find a FulfillmentJob
     * @example
     * // Get one FulfillmentJob
     * const fulfillmentJob = await prisma.fulfillmentJob.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends FulfillmentJobFindUniqueArgs>(args: SelectSubset<T, FulfillmentJobFindUniqueArgs<ExtArgs>>): Prisma__FulfillmentJobClient<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one FulfillmentJob that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {FulfillmentJobFindUniqueOrThrowArgs} args - Arguments to find a FulfillmentJob
     * @example
     * // Get one FulfillmentJob
     * const fulfillmentJob = await prisma.fulfillmentJob.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends FulfillmentJobFindUniqueOrThrowArgs>(args: SelectSubset<T, FulfillmentJobFindUniqueOrThrowArgs<ExtArgs>>): Prisma__FulfillmentJobClient<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FulfillmentJob that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FulfillmentJobFindFirstArgs} args - Arguments to find a FulfillmentJob
     * @example
     * // Get one FulfillmentJob
     * const fulfillmentJob = await prisma.fulfillmentJob.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends FulfillmentJobFindFirstArgs>(args?: SelectSubset<T, FulfillmentJobFindFirstArgs<ExtArgs>>): Prisma__FulfillmentJobClient<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first FulfillmentJob that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FulfillmentJobFindFirstOrThrowArgs} args - Arguments to find a FulfillmentJob
     * @example
     * // Get one FulfillmentJob
     * const fulfillmentJob = await prisma.fulfillmentJob.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends FulfillmentJobFindFirstOrThrowArgs>(args?: SelectSubset<T, FulfillmentJobFindFirstOrThrowArgs<ExtArgs>>): Prisma__FulfillmentJobClient<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more FulfillmentJobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FulfillmentJobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all FulfillmentJobs
     * const fulfillmentJobs = await prisma.fulfillmentJob.findMany()
     * 
     * // Get first 10 FulfillmentJobs
     * const fulfillmentJobs = await prisma.fulfillmentJob.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const fulfillmentJobWithIdOnly = await prisma.fulfillmentJob.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends FulfillmentJobFindManyArgs>(args?: SelectSubset<T, FulfillmentJobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a FulfillmentJob.
     * @param {FulfillmentJobCreateArgs} args - Arguments to create a FulfillmentJob.
     * @example
     * // Create one FulfillmentJob
     * const FulfillmentJob = await prisma.fulfillmentJob.create({
     *   data: {
     *     // ... data to create a FulfillmentJob
     *   }
     * })
     * 
     */
    create<T extends FulfillmentJobCreateArgs>(args: SelectSubset<T, FulfillmentJobCreateArgs<ExtArgs>>): Prisma__FulfillmentJobClient<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many FulfillmentJobs.
     * @param {FulfillmentJobCreateManyArgs} args - Arguments to create many FulfillmentJobs.
     * @example
     * // Create many FulfillmentJobs
     * const fulfillmentJob = await prisma.fulfillmentJob.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends FulfillmentJobCreateManyArgs>(args?: SelectSubset<T, FulfillmentJobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many FulfillmentJobs and returns the data saved in the database.
     * @param {FulfillmentJobCreateManyAndReturnArgs} args - Arguments to create many FulfillmentJobs.
     * @example
     * // Create many FulfillmentJobs
     * const fulfillmentJob = await prisma.fulfillmentJob.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many FulfillmentJobs and only return the `id`
     * const fulfillmentJobWithIdOnly = await prisma.fulfillmentJob.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends FulfillmentJobCreateManyAndReturnArgs>(args?: SelectSubset<T, FulfillmentJobCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a FulfillmentJob.
     * @param {FulfillmentJobDeleteArgs} args - Arguments to delete one FulfillmentJob.
     * @example
     * // Delete one FulfillmentJob
     * const FulfillmentJob = await prisma.fulfillmentJob.delete({
     *   where: {
     *     // ... filter to delete one FulfillmentJob
     *   }
     * })
     * 
     */
    delete<T extends FulfillmentJobDeleteArgs>(args: SelectSubset<T, FulfillmentJobDeleteArgs<ExtArgs>>): Prisma__FulfillmentJobClient<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one FulfillmentJob.
     * @param {FulfillmentJobUpdateArgs} args - Arguments to update one FulfillmentJob.
     * @example
     * // Update one FulfillmentJob
     * const fulfillmentJob = await prisma.fulfillmentJob.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends FulfillmentJobUpdateArgs>(args: SelectSubset<T, FulfillmentJobUpdateArgs<ExtArgs>>): Prisma__FulfillmentJobClient<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more FulfillmentJobs.
     * @param {FulfillmentJobDeleteManyArgs} args - Arguments to filter FulfillmentJobs to delete.
     * @example
     * // Delete a few FulfillmentJobs
     * const { count } = await prisma.fulfillmentJob.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends FulfillmentJobDeleteManyArgs>(args?: SelectSubset<T, FulfillmentJobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FulfillmentJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FulfillmentJobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many FulfillmentJobs
     * const fulfillmentJob = await prisma.fulfillmentJob.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends FulfillmentJobUpdateManyArgs>(args: SelectSubset<T, FulfillmentJobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more FulfillmentJobs and returns the data updated in the database.
     * @param {FulfillmentJobUpdateManyAndReturnArgs} args - Arguments to update many FulfillmentJobs.
     * @example
     * // Update many FulfillmentJobs
     * const fulfillmentJob = await prisma.fulfillmentJob.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more FulfillmentJobs and only return the `id`
     * const fulfillmentJobWithIdOnly = await prisma.fulfillmentJob.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends FulfillmentJobUpdateManyAndReturnArgs>(args: SelectSubset<T, FulfillmentJobUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one FulfillmentJob.
     * @param {FulfillmentJobUpsertArgs} args - Arguments to update or create a FulfillmentJob.
     * @example
     * // Update or create a FulfillmentJob
     * const fulfillmentJob = await prisma.fulfillmentJob.upsert({
     *   create: {
     *     // ... data to create a FulfillmentJob
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the FulfillmentJob we want to update
     *   }
     * })
     */
    upsert<T extends FulfillmentJobUpsertArgs>(args: SelectSubset<T, FulfillmentJobUpsertArgs<ExtArgs>>): Prisma__FulfillmentJobClient<$Result.GetResult<Prisma.$FulfillmentJobPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of FulfillmentJobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FulfillmentJobCountArgs} args - Arguments to filter FulfillmentJobs to count.
     * @example
     * // Count the number of FulfillmentJobs
     * const count = await prisma.fulfillmentJob.count({
     *   where: {
     *     // ... the filter for the FulfillmentJobs we want to count
     *   }
     * })
    **/
    count<T extends FulfillmentJobCountArgs>(
      args?: Subset<T, FulfillmentJobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], FulfillmentJobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a FulfillmentJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FulfillmentJobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends FulfillmentJobAggregateArgs>(args: Subset<T, FulfillmentJobAggregateArgs>): Prisma.PrismaPromise<GetFulfillmentJobAggregateType<T>>

    /**
     * Group by FulfillmentJob.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {FulfillmentJobGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends FulfillmentJobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: FulfillmentJobGroupByArgs['orderBy'] }
        : { orderBy?: FulfillmentJobGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, FulfillmentJobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetFulfillmentJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the FulfillmentJob model
   */
  readonly fields: FulfillmentJobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for FulfillmentJob.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__FulfillmentJobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orderItem<T extends OrderItemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderItemDefaultArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the FulfillmentJob model
   */
  interface FulfillmentJobFieldRefs {
    readonly id: FieldRef<"FulfillmentJob", 'String'>
    readonly orderItemId: FieldRef<"FulfillmentJob", 'String'>
    readonly jobType: FieldRef<"FulfillmentJob", 'String'>
    readonly status: FieldRef<"FulfillmentJob", 'FulfillmentJobStatus'>
    readonly retryCount: FieldRef<"FulfillmentJob", 'Int'>
    readonly errorMessage: FieldRef<"FulfillmentJob", 'String'>
    readonly context: FieldRef<"FulfillmentJob", 'Json'>
    readonly processedAt: FieldRef<"FulfillmentJob", 'DateTime'>
    readonly createdAt: FieldRef<"FulfillmentJob", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * FulfillmentJob findUnique
   */
  export type FulfillmentJobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobInclude<ExtArgs> | null
    /**
     * Filter, which FulfillmentJob to fetch.
     */
    where: FulfillmentJobWhereUniqueInput
  }

  /**
   * FulfillmentJob findUniqueOrThrow
   */
  export type FulfillmentJobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobInclude<ExtArgs> | null
    /**
     * Filter, which FulfillmentJob to fetch.
     */
    where: FulfillmentJobWhereUniqueInput
  }

  /**
   * FulfillmentJob findFirst
   */
  export type FulfillmentJobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobInclude<ExtArgs> | null
    /**
     * Filter, which FulfillmentJob to fetch.
     */
    where?: FulfillmentJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FulfillmentJobs to fetch.
     */
    orderBy?: FulfillmentJobOrderByWithRelationInput | FulfillmentJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FulfillmentJobs.
     */
    cursor?: FulfillmentJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FulfillmentJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FulfillmentJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FulfillmentJobs.
     */
    distinct?: FulfillmentJobScalarFieldEnum | FulfillmentJobScalarFieldEnum[]
  }

  /**
   * FulfillmentJob findFirstOrThrow
   */
  export type FulfillmentJobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobInclude<ExtArgs> | null
    /**
     * Filter, which FulfillmentJob to fetch.
     */
    where?: FulfillmentJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FulfillmentJobs to fetch.
     */
    orderBy?: FulfillmentJobOrderByWithRelationInput | FulfillmentJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for FulfillmentJobs.
     */
    cursor?: FulfillmentJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FulfillmentJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FulfillmentJobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of FulfillmentJobs.
     */
    distinct?: FulfillmentJobScalarFieldEnum | FulfillmentJobScalarFieldEnum[]
  }

  /**
   * FulfillmentJob findMany
   */
  export type FulfillmentJobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobInclude<ExtArgs> | null
    /**
     * Filter, which FulfillmentJobs to fetch.
     */
    where?: FulfillmentJobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of FulfillmentJobs to fetch.
     */
    orderBy?: FulfillmentJobOrderByWithRelationInput | FulfillmentJobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing FulfillmentJobs.
     */
    cursor?: FulfillmentJobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` FulfillmentJobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` FulfillmentJobs.
     */
    skip?: number
    distinct?: FulfillmentJobScalarFieldEnum | FulfillmentJobScalarFieldEnum[]
  }

  /**
   * FulfillmentJob create
   */
  export type FulfillmentJobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobInclude<ExtArgs> | null
    /**
     * The data needed to create a FulfillmentJob.
     */
    data: XOR<FulfillmentJobCreateInput, FulfillmentJobUncheckedCreateInput>
  }

  /**
   * FulfillmentJob createMany
   */
  export type FulfillmentJobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many FulfillmentJobs.
     */
    data: FulfillmentJobCreateManyInput | FulfillmentJobCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * FulfillmentJob createManyAndReturn
   */
  export type FulfillmentJobCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * The data used to create many FulfillmentJobs.
     */
    data: FulfillmentJobCreateManyInput | FulfillmentJobCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * FulfillmentJob update
   */
  export type FulfillmentJobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobInclude<ExtArgs> | null
    /**
     * The data needed to update a FulfillmentJob.
     */
    data: XOR<FulfillmentJobUpdateInput, FulfillmentJobUncheckedUpdateInput>
    /**
     * Choose, which FulfillmentJob to update.
     */
    where: FulfillmentJobWhereUniqueInput
  }

  /**
   * FulfillmentJob updateMany
   */
  export type FulfillmentJobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update FulfillmentJobs.
     */
    data: XOR<FulfillmentJobUpdateManyMutationInput, FulfillmentJobUncheckedUpdateManyInput>
    /**
     * Filter which FulfillmentJobs to update
     */
    where?: FulfillmentJobWhereInput
    /**
     * Limit how many FulfillmentJobs to update.
     */
    limit?: number
  }

  /**
   * FulfillmentJob updateManyAndReturn
   */
  export type FulfillmentJobUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * The data used to update FulfillmentJobs.
     */
    data: XOR<FulfillmentJobUpdateManyMutationInput, FulfillmentJobUncheckedUpdateManyInput>
    /**
     * Filter which FulfillmentJobs to update
     */
    where?: FulfillmentJobWhereInput
    /**
     * Limit how many FulfillmentJobs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * FulfillmentJob upsert
   */
  export type FulfillmentJobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobInclude<ExtArgs> | null
    /**
     * The filter to search for the FulfillmentJob to update in case it exists.
     */
    where: FulfillmentJobWhereUniqueInput
    /**
     * In case the FulfillmentJob found by the `where` argument doesn't exist, create a new FulfillmentJob with this data.
     */
    create: XOR<FulfillmentJobCreateInput, FulfillmentJobUncheckedCreateInput>
    /**
     * In case the FulfillmentJob was found with the provided `where` argument, update it with this data.
     */
    update: XOR<FulfillmentJobUpdateInput, FulfillmentJobUncheckedUpdateInput>
  }

  /**
   * FulfillmentJob delete
   */
  export type FulfillmentJobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobInclude<ExtArgs> | null
    /**
     * Filter which FulfillmentJob to delete.
     */
    where: FulfillmentJobWhereUniqueInput
  }

  /**
   * FulfillmentJob deleteMany
   */
  export type FulfillmentJobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which FulfillmentJobs to delete
     */
    where?: FulfillmentJobWhereInput
    /**
     * Limit how many FulfillmentJobs to delete.
     */
    limit?: number
  }

  /**
   * FulfillmentJob without action
   */
  export type FulfillmentJobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the FulfillmentJob
     */
    select?: FulfillmentJobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the FulfillmentJob
     */
    omit?: FulfillmentJobOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: FulfillmentJobInclude<ExtArgs> | null
  }


  /**
   * Model EmailLog
   */

  export type AggregateEmailLog = {
    _count: EmailLogCountAggregateOutputType | null
    _min: EmailLogMinAggregateOutputType | null
    _max: EmailLogMaxAggregateOutputType | null
  }

  export type EmailLogMinAggregateOutputType = {
    id: string | null
    orderItemId: string | null
    recipientEmail: string | null
    provider: string | null
    providerMessageId: string | null
    templateName: string | null
    status: $Enums.EmailLogStatus | null
    errorMessage: string | null
    sentAt: Date | null
    createdAt: Date | null
  }

  export type EmailLogMaxAggregateOutputType = {
    id: string | null
    orderItemId: string | null
    recipientEmail: string | null
    provider: string | null
    providerMessageId: string | null
    templateName: string | null
    status: $Enums.EmailLogStatus | null
    errorMessage: string | null
    sentAt: Date | null
    createdAt: Date | null
  }

  export type EmailLogCountAggregateOutputType = {
    id: number
    orderItemId: number
    recipientEmail: number
    provider: number
    providerMessageId: number
    templateName: number
    status: number
    errorMessage: number
    sentAt: number
    createdAt: number
    _all: number
  }


  export type EmailLogMinAggregateInputType = {
    id?: true
    orderItemId?: true
    recipientEmail?: true
    provider?: true
    providerMessageId?: true
    templateName?: true
    status?: true
    errorMessage?: true
    sentAt?: true
    createdAt?: true
  }

  export type EmailLogMaxAggregateInputType = {
    id?: true
    orderItemId?: true
    recipientEmail?: true
    provider?: true
    providerMessageId?: true
    templateName?: true
    status?: true
    errorMessage?: true
    sentAt?: true
    createdAt?: true
  }

  export type EmailLogCountAggregateInputType = {
    id?: true
    orderItemId?: true
    recipientEmail?: true
    provider?: true
    providerMessageId?: true
    templateName?: true
    status?: true
    errorMessage?: true
    sentAt?: true
    createdAt?: true
    _all?: true
  }

  export type EmailLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailLog to aggregate.
     */
    where?: EmailLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailLogs to fetch.
     */
    orderBy?: EmailLogOrderByWithRelationInput | EmailLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmailLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned EmailLogs
    **/
    _count?: true | EmailLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmailLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmailLogMaxAggregateInputType
  }

  export type GetEmailLogAggregateType<T extends EmailLogAggregateArgs> = {
        [P in keyof T & keyof AggregateEmailLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmailLog[P]>
      : GetScalarType<T[P], AggregateEmailLog[P]>
  }




  export type EmailLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmailLogWhereInput
    orderBy?: EmailLogOrderByWithAggregationInput | EmailLogOrderByWithAggregationInput[]
    by: EmailLogScalarFieldEnum[] | EmailLogScalarFieldEnum
    having?: EmailLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmailLogCountAggregateInputType | true
    _min?: EmailLogMinAggregateInputType
    _max?: EmailLogMaxAggregateInputType
  }

  export type EmailLogGroupByOutputType = {
    id: string
    orderItemId: string
    recipientEmail: string
    provider: string
    providerMessageId: string | null
    templateName: string
    status: $Enums.EmailLogStatus
    errorMessage: string | null
    sentAt: Date | null
    createdAt: Date
    _count: EmailLogCountAggregateOutputType | null
    _min: EmailLogMinAggregateOutputType | null
    _max: EmailLogMaxAggregateOutputType | null
  }

  type GetEmailLogGroupByPayload<T extends EmailLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmailLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmailLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmailLogGroupByOutputType[P]>
            : GetScalarType<T[P], EmailLogGroupByOutputType[P]>
        }
      >
    >


  export type EmailLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderItemId?: boolean
    recipientEmail?: boolean
    provider?: boolean
    providerMessageId?: boolean
    templateName?: boolean
    status?: boolean
    errorMessage?: boolean
    sentAt?: boolean
    createdAt?: boolean
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailLog"]>

  export type EmailLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderItemId?: boolean
    recipientEmail?: boolean
    provider?: boolean
    providerMessageId?: boolean
    templateName?: boolean
    status?: boolean
    errorMessage?: boolean
    sentAt?: boolean
    createdAt?: boolean
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailLog"]>

  export type EmailLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderItemId?: boolean
    recipientEmail?: boolean
    provider?: boolean
    providerMessageId?: boolean
    templateName?: boolean
    status?: boolean
    errorMessage?: boolean
    sentAt?: boolean
    createdAt?: boolean
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["emailLog"]>

  export type EmailLogSelectScalar = {
    id?: boolean
    orderItemId?: boolean
    recipientEmail?: boolean
    provider?: boolean
    providerMessageId?: boolean
    templateName?: boolean
    status?: boolean
    errorMessage?: boolean
    sentAt?: boolean
    createdAt?: boolean
  }

  export type EmailLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "orderItemId" | "recipientEmail" | "provider" | "providerMessageId" | "templateName" | "status" | "errorMessage" | "sentAt" | "createdAt", ExtArgs["result"]["emailLog"]>
  export type EmailLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }
  export type EmailLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }
  export type EmailLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderItem?: boolean | OrderItemDefaultArgs<ExtArgs>
  }

  export type $EmailLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "EmailLog"
    objects: {
      orderItem: Prisma.$OrderItemPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      orderItemId: string
      recipientEmail: string
      provider: string
      providerMessageId: string | null
      templateName: string
      status: $Enums.EmailLogStatus
      errorMessage: string | null
      sentAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["emailLog"]>
    composites: {}
  }

  type EmailLogGetPayload<S extends boolean | null | undefined | EmailLogDefaultArgs> = $Result.GetResult<Prisma.$EmailLogPayload, S>

  type EmailLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<EmailLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: EmailLogCountAggregateInputType | true
    }

  export interface EmailLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['EmailLog'], meta: { name: 'EmailLog' } }
    /**
     * Find zero or one EmailLog that matches the filter.
     * @param {EmailLogFindUniqueArgs} args - Arguments to find a EmailLog
     * @example
     * // Get one EmailLog
     * const emailLog = await prisma.emailLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmailLogFindUniqueArgs>(args: SelectSubset<T, EmailLogFindUniqueArgs<ExtArgs>>): Prisma__EmailLogClient<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one EmailLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {EmailLogFindUniqueOrThrowArgs} args - Arguments to find a EmailLog
     * @example
     * // Get one EmailLog
     * const emailLog = await prisma.emailLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmailLogFindUniqueOrThrowArgs>(args: SelectSubset<T, EmailLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmailLogClient<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmailLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogFindFirstArgs} args - Arguments to find a EmailLog
     * @example
     * // Get one EmailLog
     * const emailLog = await prisma.emailLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmailLogFindFirstArgs>(args?: SelectSubset<T, EmailLogFindFirstArgs<ExtArgs>>): Prisma__EmailLogClient<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first EmailLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogFindFirstOrThrowArgs} args - Arguments to find a EmailLog
     * @example
     * // Get one EmailLog
     * const emailLog = await prisma.emailLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmailLogFindFirstOrThrowArgs>(args?: SelectSubset<T, EmailLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmailLogClient<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more EmailLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all EmailLogs
     * const emailLogs = await prisma.emailLog.findMany()
     * 
     * // Get first 10 EmailLogs
     * const emailLogs = await prisma.emailLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const emailLogWithIdOnly = await prisma.emailLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmailLogFindManyArgs>(args?: SelectSubset<T, EmailLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a EmailLog.
     * @param {EmailLogCreateArgs} args - Arguments to create a EmailLog.
     * @example
     * // Create one EmailLog
     * const EmailLog = await prisma.emailLog.create({
     *   data: {
     *     // ... data to create a EmailLog
     *   }
     * })
     * 
     */
    create<T extends EmailLogCreateArgs>(args: SelectSubset<T, EmailLogCreateArgs<ExtArgs>>): Prisma__EmailLogClient<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many EmailLogs.
     * @param {EmailLogCreateManyArgs} args - Arguments to create many EmailLogs.
     * @example
     * // Create many EmailLogs
     * const emailLog = await prisma.emailLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmailLogCreateManyArgs>(args?: SelectSubset<T, EmailLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many EmailLogs and returns the data saved in the database.
     * @param {EmailLogCreateManyAndReturnArgs} args - Arguments to create many EmailLogs.
     * @example
     * // Create many EmailLogs
     * const emailLog = await prisma.emailLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many EmailLogs and only return the `id`
     * const emailLogWithIdOnly = await prisma.emailLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmailLogCreateManyAndReturnArgs>(args?: SelectSubset<T, EmailLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a EmailLog.
     * @param {EmailLogDeleteArgs} args - Arguments to delete one EmailLog.
     * @example
     * // Delete one EmailLog
     * const EmailLog = await prisma.emailLog.delete({
     *   where: {
     *     // ... filter to delete one EmailLog
     *   }
     * })
     * 
     */
    delete<T extends EmailLogDeleteArgs>(args: SelectSubset<T, EmailLogDeleteArgs<ExtArgs>>): Prisma__EmailLogClient<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one EmailLog.
     * @param {EmailLogUpdateArgs} args - Arguments to update one EmailLog.
     * @example
     * // Update one EmailLog
     * const emailLog = await prisma.emailLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmailLogUpdateArgs>(args: SelectSubset<T, EmailLogUpdateArgs<ExtArgs>>): Prisma__EmailLogClient<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more EmailLogs.
     * @param {EmailLogDeleteManyArgs} args - Arguments to filter EmailLogs to delete.
     * @example
     * // Delete a few EmailLogs
     * const { count } = await prisma.emailLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmailLogDeleteManyArgs>(args?: SelectSubset<T, EmailLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmailLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many EmailLogs
     * const emailLog = await prisma.emailLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmailLogUpdateManyArgs>(args: SelectSubset<T, EmailLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more EmailLogs and returns the data updated in the database.
     * @param {EmailLogUpdateManyAndReturnArgs} args - Arguments to update many EmailLogs.
     * @example
     * // Update many EmailLogs
     * const emailLog = await prisma.emailLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more EmailLogs and only return the `id`
     * const emailLogWithIdOnly = await prisma.emailLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends EmailLogUpdateManyAndReturnArgs>(args: SelectSubset<T, EmailLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one EmailLog.
     * @param {EmailLogUpsertArgs} args - Arguments to update or create a EmailLog.
     * @example
     * // Update or create a EmailLog
     * const emailLog = await prisma.emailLog.upsert({
     *   create: {
     *     // ... data to create a EmailLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the EmailLog we want to update
     *   }
     * })
     */
    upsert<T extends EmailLogUpsertArgs>(args: SelectSubset<T, EmailLogUpsertArgs<ExtArgs>>): Prisma__EmailLogClient<$Result.GetResult<Prisma.$EmailLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of EmailLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogCountArgs} args - Arguments to filter EmailLogs to count.
     * @example
     * // Count the number of EmailLogs
     * const count = await prisma.emailLog.count({
     *   where: {
     *     // ... the filter for the EmailLogs we want to count
     *   }
     * })
    **/
    count<T extends EmailLogCountArgs>(
      args?: Subset<T, EmailLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmailLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a EmailLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmailLogAggregateArgs>(args: Subset<T, EmailLogAggregateArgs>): Prisma.PrismaPromise<GetEmailLogAggregateType<T>>

    /**
     * Group by EmailLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmailLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmailLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmailLogGroupByArgs['orderBy'] }
        : { orderBy?: EmailLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmailLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmailLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the EmailLog model
   */
  readonly fields: EmailLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for EmailLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmailLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orderItem<T extends OrderItemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderItemDefaultArgs<ExtArgs>>): Prisma__OrderItemClient<$Result.GetResult<Prisma.$OrderItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the EmailLog model
   */
  interface EmailLogFieldRefs {
    readonly id: FieldRef<"EmailLog", 'String'>
    readonly orderItemId: FieldRef<"EmailLog", 'String'>
    readonly recipientEmail: FieldRef<"EmailLog", 'String'>
    readonly provider: FieldRef<"EmailLog", 'String'>
    readonly providerMessageId: FieldRef<"EmailLog", 'String'>
    readonly templateName: FieldRef<"EmailLog", 'String'>
    readonly status: FieldRef<"EmailLog", 'EmailLogStatus'>
    readonly errorMessage: FieldRef<"EmailLog", 'String'>
    readonly sentAt: FieldRef<"EmailLog", 'DateTime'>
    readonly createdAt: FieldRef<"EmailLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * EmailLog findUnique
   */
  export type EmailLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogInclude<ExtArgs> | null
    /**
     * Filter, which EmailLog to fetch.
     */
    where: EmailLogWhereUniqueInput
  }

  /**
   * EmailLog findUniqueOrThrow
   */
  export type EmailLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogInclude<ExtArgs> | null
    /**
     * Filter, which EmailLog to fetch.
     */
    where: EmailLogWhereUniqueInput
  }

  /**
   * EmailLog findFirst
   */
  export type EmailLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogInclude<ExtArgs> | null
    /**
     * Filter, which EmailLog to fetch.
     */
    where?: EmailLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailLogs to fetch.
     */
    orderBy?: EmailLogOrderByWithRelationInput | EmailLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailLogs.
     */
    cursor?: EmailLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailLogs.
     */
    distinct?: EmailLogScalarFieldEnum | EmailLogScalarFieldEnum[]
  }

  /**
   * EmailLog findFirstOrThrow
   */
  export type EmailLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogInclude<ExtArgs> | null
    /**
     * Filter, which EmailLog to fetch.
     */
    where?: EmailLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailLogs to fetch.
     */
    orderBy?: EmailLogOrderByWithRelationInput | EmailLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for EmailLogs.
     */
    cursor?: EmailLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of EmailLogs.
     */
    distinct?: EmailLogScalarFieldEnum | EmailLogScalarFieldEnum[]
  }

  /**
   * EmailLog findMany
   */
  export type EmailLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogInclude<ExtArgs> | null
    /**
     * Filter, which EmailLogs to fetch.
     */
    where?: EmailLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of EmailLogs to fetch.
     */
    orderBy?: EmailLogOrderByWithRelationInput | EmailLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing EmailLogs.
     */
    cursor?: EmailLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` EmailLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` EmailLogs.
     */
    skip?: number
    distinct?: EmailLogScalarFieldEnum | EmailLogScalarFieldEnum[]
  }

  /**
   * EmailLog create
   */
  export type EmailLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogInclude<ExtArgs> | null
    /**
     * The data needed to create a EmailLog.
     */
    data: XOR<EmailLogCreateInput, EmailLogUncheckedCreateInput>
  }

  /**
   * EmailLog createMany
   */
  export type EmailLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many EmailLogs.
     */
    data: EmailLogCreateManyInput | EmailLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * EmailLog createManyAndReturn
   */
  export type EmailLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * The data used to create many EmailLogs.
     */
    data: EmailLogCreateManyInput | EmailLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmailLog update
   */
  export type EmailLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogInclude<ExtArgs> | null
    /**
     * The data needed to update a EmailLog.
     */
    data: XOR<EmailLogUpdateInput, EmailLogUncheckedUpdateInput>
    /**
     * Choose, which EmailLog to update.
     */
    where: EmailLogWhereUniqueInput
  }

  /**
   * EmailLog updateMany
   */
  export type EmailLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update EmailLogs.
     */
    data: XOR<EmailLogUpdateManyMutationInput, EmailLogUncheckedUpdateManyInput>
    /**
     * Filter which EmailLogs to update
     */
    where?: EmailLogWhereInput
    /**
     * Limit how many EmailLogs to update.
     */
    limit?: number
  }

  /**
   * EmailLog updateManyAndReturn
   */
  export type EmailLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * The data used to update EmailLogs.
     */
    data: XOR<EmailLogUpdateManyMutationInput, EmailLogUncheckedUpdateManyInput>
    /**
     * Filter which EmailLogs to update
     */
    where?: EmailLogWhereInput
    /**
     * Limit how many EmailLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * EmailLog upsert
   */
  export type EmailLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogInclude<ExtArgs> | null
    /**
     * The filter to search for the EmailLog to update in case it exists.
     */
    where: EmailLogWhereUniqueInput
    /**
     * In case the EmailLog found by the `where` argument doesn't exist, create a new EmailLog with this data.
     */
    create: XOR<EmailLogCreateInput, EmailLogUncheckedCreateInput>
    /**
     * In case the EmailLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmailLogUpdateInput, EmailLogUncheckedUpdateInput>
  }

  /**
   * EmailLog delete
   */
  export type EmailLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogInclude<ExtArgs> | null
    /**
     * Filter which EmailLog to delete.
     */
    where: EmailLogWhereUniqueInput
  }

  /**
   * EmailLog deleteMany
   */
  export type EmailLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which EmailLogs to delete
     */
    where?: EmailLogWhereInput
    /**
     * Limit how many EmailLogs to delete.
     */
    limit?: number
  }

  /**
   * EmailLog without action
   */
  export type EmailLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the EmailLog
     */
    select?: EmailLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the EmailLog
     */
    omit?: EmailLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: EmailLogInclude<ExtArgs> | null
  }


  /**
   * Model MailTemplate
   */

  export type AggregateMailTemplate = {
    _count: MailTemplateCountAggregateOutputType | null
    _min: MailTemplateMinAggregateOutputType | null
    _max: MailTemplateMaxAggregateOutputType | null
  }

  export type MailTemplateMinAggregateOutputType = {
    id: string | null
    name: string | null
    subject: string | null
    bodyHtml: string | null
    bodyText: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MailTemplateMaxAggregateOutputType = {
    id: string | null
    name: string | null
    subject: string | null
    bodyHtml: string | null
    bodyText: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MailTemplateCountAggregateOutputType = {
    id: number
    name: number
    subject: number
    bodyHtml: number
    bodyText: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MailTemplateMinAggregateInputType = {
    id?: true
    name?: true
    subject?: true
    bodyHtml?: true
    bodyText?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MailTemplateMaxAggregateInputType = {
    id?: true
    name?: true
    subject?: true
    bodyHtml?: true
    bodyText?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MailTemplateCountAggregateInputType = {
    id?: true
    name?: true
    subject?: true
    bodyHtml?: true
    bodyText?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MailTemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MailTemplate to aggregate.
     */
    where?: MailTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MailTemplates to fetch.
     */
    orderBy?: MailTemplateOrderByWithRelationInput | MailTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MailTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MailTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MailTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MailTemplates
    **/
    _count?: true | MailTemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MailTemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MailTemplateMaxAggregateInputType
  }

  export type GetMailTemplateAggregateType<T extends MailTemplateAggregateArgs> = {
        [P in keyof T & keyof AggregateMailTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMailTemplate[P]>
      : GetScalarType<T[P], AggregateMailTemplate[P]>
  }




  export type MailTemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MailTemplateWhereInput
    orderBy?: MailTemplateOrderByWithAggregationInput | MailTemplateOrderByWithAggregationInput[]
    by: MailTemplateScalarFieldEnum[] | MailTemplateScalarFieldEnum
    having?: MailTemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MailTemplateCountAggregateInputType | true
    _min?: MailTemplateMinAggregateInputType
    _max?: MailTemplateMaxAggregateInputType
  }

  export type MailTemplateGroupByOutputType = {
    id: string
    name: string
    subject: string
    bodyHtml: string
    bodyText: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: MailTemplateCountAggregateOutputType | null
    _min: MailTemplateMinAggregateOutputType | null
    _max: MailTemplateMaxAggregateOutputType | null
  }

  type GetMailTemplateGroupByPayload<T extends MailTemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MailTemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MailTemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MailTemplateGroupByOutputType[P]>
            : GetScalarType<T[P], MailTemplateGroupByOutputType[P]>
        }
      >
    >


  export type MailTemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    subject?: boolean
    bodyHtml?: boolean
    bodyText?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    products?: boolean | MailTemplate$productsArgs<ExtArgs>
    _count?: boolean | MailTemplateCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["mailTemplate"]>

  export type MailTemplateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    subject?: boolean
    bodyHtml?: boolean
    bodyText?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["mailTemplate"]>

  export type MailTemplateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    subject?: boolean
    bodyHtml?: boolean
    bodyText?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["mailTemplate"]>

  export type MailTemplateSelectScalar = {
    id?: boolean
    name?: boolean
    subject?: boolean
    bodyHtml?: boolean
    bodyText?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type MailTemplateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "subject" | "bodyHtml" | "bodyText" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["mailTemplate"]>
  export type MailTemplateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    products?: boolean | MailTemplate$productsArgs<ExtArgs>
    _count?: boolean | MailTemplateCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type MailTemplateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type MailTemplateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $MailTemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MailTemplate"
    objects: {
      products: Prisma.$ProductPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      subject: string
      bodyHtml: string
      bodyText: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["mailTemplate"]>
    composites: {}
  }

  type MailTemplateGetPayload<S extends boolean | null | undefined | MailTemplateDefaultArgs> = $Result.GetResult<Prisma.$MailTemplatePayload, S>

  type MailTemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MailTemplateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MailTemplateCountAggregateInputType | true
    }

  export interface MailTemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MailTemplate'], meta: { name: 'MailTemplate' } }
    /**
     * Find zero or one MailTemplate that matches the filter.
     * @param {MailTemplateFindUniqueArgs} args - Arguments to find a MailTemplate
     * @example
     * // Get one MailTemplate
     * const mailTemplate = await prisma.mailTemplate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MailTemplateFindUniqueArgs>(args: SelectSubset<T, MailTemplateFindUniqueArgs<ExtArgs>>): Prisma__MailTemplateClient<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MailTemplate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MailTemplateFindUniqueOrThrowArgs} args - Arguments to find a MailTemplate
     * @example
     * // Get one MailTemplate
     * const mailTemplate = await prisma.mailTemplate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MailTemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, MailTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MailTemplateClient<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MailTemplate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MailTemplateFindFirstArgs} args - Arguments to find a MailTemplate
     * @example
     * // Get one MailTemplate
     * const mailTemplate = await prisma.mailTemplate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MailTemplateFindFirstArgs>(args?: SelectSubset<T, MailTemplateFindFirstArgs<ExtArgs>>): Prisma__MailTemplateClient<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MailTemplate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MailTemplateFindFirstOrThrowArgs} args - Arguments to find a MailTemplate
     * @example
     * // Get one MailTemplate
     * const mailTemplate = await prisma.mailTemplate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MailTemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, MailTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__MailTemplateClient<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MailTemplates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MailTemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MailTemplates
     * const mailTemplates = await prisma.mailTemplate.findMany()
     * 
     * // Get first 10 MailTemplates
     * const mailTemplates = await prisma.mailTemplate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const mailTemplateWithIdOnly = await prisma.mailTemplate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MailTemplateFindManyArgs>(args?: SelectSubset<T, MailTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MailTemplate.
     * @param {MailTemplateCreateArgs} args - Arguments to create a MailTemplate.
     * @example
     * // Create one MailTemplate
     * const MailTemplate = await prisma.mailTemplate.create({
     *   data: {
     *     // ... data to create a MailTemplate
     *   }
     * })
     * 
     */
    create<T extends MailTemplateCreateArgs>(args: SelectSubset<T, MailTemplateCreateArgs<ExtArgs>>): Prisma__MailTemplateClient<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MailTemplates.
     * @param {MailTemplateCreateManyArgs} args - Arguments to create many MailTemplates.
     * @example
     * // Create many MailTemplates
     * const mailTemplate = await prisma.mailTemplate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MailTemplateCreateManyArgs>(args?: SelectSubset<T, MailTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MailTemplates and returns the data saved in the database.
     * @param {MailTemplateCreateManyAndReturnArgs} args - Arguments to create many MailTemplates.
     * @example
     * // Create many MailTemplates
     * const mailTemplate = await prisma.mailTemplate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MailTemplates and only return the `id`
     * const mailTemplateWithIdOnly = await prisma.mailTemplate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MailTemplateCreateManyAndReturnArgs>(args?: SelectSubset<T, MailTemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MailTemplate.
     * @param {MailTemplateDeleteArgs} args - Arguments to delete one MailTemplate.
     * @example
     * // Delete one MailTemplate
     * const MailTemplate = await prisma.mailTemplate.delete({
     *   where: {
     *     // ... filter to delete one MailTemplate
     *   }
     * })
     * 
     */
    delete<T extends MailTemplateDeleteArgs>(args: SelectSubset<T, MailTemplateDeleteArgs<ExtArgs>>): Prisma__MailTemplateClient<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MailTemplate.
     * @param {MailTemplateUpdateArgs} args - Arguments to update one MailTemplate.
     * @example
     * // Update one MailTemplate
     * const mailTemplate = await prisma.mailTemplate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MailTemplateUpdateArgs>(args: SelectSubset<T, MailTemplateUpdateArgs<ExtArgs>>): Prisma__MailTemplateClient<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MailTemplates.
     * @param {MailTemplateDeleteManyArgs} args - Arguments to filter MailTemplates to delete.
     * @example
     * // Delete a few MailTemplates
     * const { count } = await prisma.mailTemplate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MailTemplateDeleteManyArgs>(args?: SelectSubset<T, MailTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MailTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MailTemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MailTemplates
     * const mailTemplate = await prisma.mailTemplate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MailTemplateUpdateManyArgs>(args: SelectSubset<T, MailTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MailTemplates and returns the data updated in the database.
     * @param {MailTemplateUpdateManyAndReturnArgs} args - Arguments to update many MailTemplates.
     * @example
     * // Update many MailTemplates
     * const mailTemplate = await prisma.mailTemplate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MailTemplates and only return the `id`
     * const mailTemplateWithIdOnly = await prisma.mailTemplate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MailTemplateUpdateManyAndReturnArgs>(args: SelectSubset<T, MailTemplateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MailTemplate.
     * @param {MailTemplateUpsertArgs} args - Arguments to update or create a MailTemplate.
     * @example
     * // Update or create a MailTemplate
     * const mailTemplate = await prisma.mailTemplate.upsert({
     *   create: {
     *     // ... data to create a MailTemplate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MailTemplate we want to update
     *   }
     * })
     */
    upsert<T extends MailTemplateUpsertArgs>(args: SelectSubset<T, MailTemplateUpsertArgs<ExtArgs>>): Prisma__MailTemplateClient<$Result.GetResult<Prisma.$MailTemplatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MailTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MailTemplateCountArgs} args - Arguments to filter MailTemplates to count.
     * @example
     * // Count the number of MailTemplates
     * const count = await prisma.mailTemplate.count({
     *   where: {
     *     // ... the filter for the MailTemplates we want to count
     *   }
     * })
    **/
    count<T extends MailTemplateCountArgs>(
      args?: Subset<T, MailTemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MailTemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MailTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MailTemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MailTemplateAggregateArgs>(args: Subset<T, MailTemplateAggregateArgs>): Prisma.PrismaPromise<GetMailTemplateAggregateType<T>>

    /**
     * Group by MailTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MailTemplateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MailTemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MailTemplateGroupByArgs['orderBy'] }
        : { orderBy?: MailTemplateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MailTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMailTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MailTemplate model
   */
  readonly fields: MailTemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MailTemplate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MailTemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    products<T extends MailTemplate$productsArgs<ExtArgs> = {}>(args?: Subset<T, MailTemplate$productsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MailTemplate model
   */
  interface MailTemplateFieldRefs {
    readonly id: FieldRef<"MailTemplate", 'String'>
    readonly name: FieldRef<"MailTemplate", 'String'>
    readonly subject: FieldRef<"MailTemplate", 'String'>
    readonly bodyHtml: FieldRef<"MailTemplate", 'String'>
    readonly bodyText: FieldRef<"MailTemplate", 'String'>
    readonly isActive: FieldRef<"MailTemplate", 'Boolean'>
    readonly createdAt: FieldRef<"MailTemplate", 'DateTime'>
    readonly updatedAt: FieldRef<"MailTemplate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MailTemplate findUnique
   */
  export type MailTemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MailTemplateInclude<ExtArgs> | null
    /**
     * Filter, which MailTemplate to fetch.
     */
    where: MailTemplateWhereUniqueInput
  }

  /**
   * MailTemplate findUniqueOrThrow
   */
  export type MailTemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MailTemplateInclude<ExtArgs> | null
    /**
     * Filter, which MailTemplate to fetch.
     */
    where: MailTemplateWhereUniqueInput
  }

  /**
   * MailTemplate findFirst
   */
  export type MailTemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MailTemplateInclude<ExtArgs> | null
    /**
     * Filter, which MailTemplate to fetch.
     */
    where?: MailTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MailTemplates to fetch.
     */
    orderBy?: MailTemplateOrderByWithRelationInput | MailTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MailTemplates.
     */
    cursor?: MailTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MailTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MailTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MailTemplates.
     */
    distinct?: MailTemplateScalarFieldEnum | MailTemplateScalarFieldEnum[]
  }

  /**
   * MailTemplate findFirstOrThrow
   */
  export type MailTemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MailTemplateInclude<ExtArgs> | null
    /**
     * Filter, which MailTemplate to fetch.
     */
    where?: MailTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MailTemplates to fetch.
     */
    orderBy?: MailTemplateOrderByWithRelationInput | MailTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MailTemplates.
     */
    cursor?: MailTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MailTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MailTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MailTemplates.
     */
    distinct?: MailTemplateScalarFieldEnum | MailTemplateScalarFieldEnum[]
  }

  /**
   * MailTemplate findMany
   */
  export type MailTemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MailTemplateInclude<ExtArgs> | null
    /**
     * Filter, which MailTemplates to fetch.
     */
    where?: MailTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MailTemplates to fetch.
     */
    orderBy?: MailTemplateOrderByWithRelationInput | MailTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MailTemplates.
     */
    cursor?: MailTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MailTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MailTemplates.
     */
    skip?: number
    distinct?: MailTemplateScalarFieldEnum | MailTemplateScalarFieldEnum[]
  }

  /**
   * MailTemplate create
   */
  export type MailTemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MailTemplateInclude<ExtArgs> | null
    /**
     * The data needed to create a MailTemplate.
     */
    data: XOR<MailTemplateCreateInput, MailTemplateUncheckedCreateInput>
  }

  /**
   * MailTemplate createMany
   */
  export type MailTemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MailTemplates.
     */
    data: MailTemplateCreateManyInput | MailTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MailTemplate createManyAndReturn
   */
  export type MailTemplateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * The data used to create many MailTemplates.
     */
    data: MailTemplateCreateManyInput | MailTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MailTemplate update
   */
  export type MailTemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MailTemplateInclude<ExtArgs> | null
    /**
     * The data needed to update a MailTemplate.
     */
    data: XOR<MailTemplateUpdateInput, MailTemplateUncheckedUpdateInput>
    /**
     * Choose, which MailTemplate to update.
     */
    where: MailTemplateWhereUniqueInput
  }

  /**
   * MailTemplate updateMany
   */
  export type MailTemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MailTemplates.
     */
    data: XOR<MailTemplateUpdateManyMutationInput, MailTemplateUncheckedUpdateManyInput>
    /**
     * Filter which MailTemplates to update
     */
    where?: MailTemplateWhereInput
    /**
     * Limit how many MailTemplates to update.
     */
    limit?: number
  }

  /**
   * MailTemplate updateManyAndReturn
   */
  export type MailTemplateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * The data used to update MailTemplates.
     */
    data: XOR<MailTemplateUpdateManyMutationInput, MailTemplateUncheckedUpdateManyInput>
    /**
     * Filter which MailTemplates to update
     */
    where?: MailTemplateWhereInput
    /**
     * Limit how many MailTemplates to update.
     */
    limit?: number
  }

  /**
   * MailTemplate upsert
   */
  export type MailTemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MailTemplateInclude<ExtArgs> | null
    /**
     * The filter to search for the MailTemplate to update in case it exists.
     */
    where: MailTemplateWhereUniqueInput
    /**
     * In case the MailTemplate found by the `where` argument doesn't exist, create a new MailTemplate with this data.
     */
    create: XOR<MailTemplateCreateInput, MailTemplateUncheckedCreateInput>
    /**
     * In case the MailTemplate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MailTemplateUpdateInput, MailTemplateUncheckedUpdateInput>
  }

  /**
   * MailTemplate delete
   */
  export type MailTemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MailTemplateInclude<ExtArgs> | null
    /**
     * Filter which MailTemplate to delete.
     */
    where: MailTemplateWhereUniqueInput
  }

  /**
   * MailTemplate deleteMany
   */
  export type MailTemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MailTemplates to delete
     */
    where?: MailTemplateWhereInput
    /**
     * Limit how many MailTemplates to delete.
     */
    limit?: number
  }

  /**
   * MailTemplate.products
   */
  export type MailTemplate$productsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    cursor?: ProductWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * MailTemplate without action
   */
  export type MailTemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MailTemplate
     */
    select?: MailTemplateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MailTemplate
     */
    omit?: MailTemplateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MailTemplateInclude<ExtArgs> | null
  }


  /**
   * Model InventoryAlertState
   */

  export type AggregateInventoryAlertState = {
    _count: InventoryAlertStateCountAggregateOutputType | null
    _avg: InventoryAlertStateAvgAggregateOutputType | null
    _sum: InventoryAlertStateSumAggregateOutputType | null
    _min: InventoryAlertStateMinAggregateOutputType | null
    _max: InventoryAlertStateMaxAggregateOutputType | null
  }

  export type InventoryAlertStateAvgAggregateOutputType = {
    lastKnownAvailableCount: number | null
  }

  export type InventoryAlertStateSumAggregateOutputType = {
    lastKnownAvailableCount: number | null
  }

  export type InventoryAlertStateMinAggregateOutputType = {
    id: string | null
    productId: string | null
    lowStockAlertSent: boolean | null
    outOfStockAlertSent: boolean | null
    lastKnownAvailableCount: number | null
    updatedAt: Date | null
  }

  export type InventoryAlertStateMaxAggregateOutputType = {
    id: string | null
    productId: string | null
    lowStockAlertSent: boolean | null
    outOfStockAlertSent: boolean | null
    lastKnownAvailableCount: number | null
    updatedAt: Date | null
  }

  export type InventoryAlertStateCountAggregateOutputType = {
    id: number
    productId: number
    lowStockAlertSent: number
    outOfStockAlertSent: number
    lastKnownAvailableCount: number
    updatedAt: number
    _all: number
  }


  export type InventoryAlertStateAvgAggregateInputType = {
    lastKnownAvailableCount?: true
  }

  export type InventoryAlertStateSumAggregateInputType = {
    lastKnownAvailableCount?: true
  }

  export type InventoryAlertStateMinAggregateInputType = {
    id?: true
    productId?: true
    lowStockAlertSent?: true
    outOfStockAlertSent?: true
    lastKnownAvailableCount?: true
    updatedAt?: true
  }

  export type InventoryAlertStateMaxAggregateInputType = {
    id?: true
    productId?: true
    lowStockAlertSent?: true
    outOfStockAlertSent?: true
    lastKnownAvailableCount?: true
    updatedAt?: true
  }

  export type InventoryAlertStateCountAggregateInputType = {
    id?: true
    productId?: true
    lowStockAlertSent?: true
    outOfStockAlertSent?: true
    lastKnownAvailableCount?: true
    updatedAt?: true
    _all?: true
  }

  export type InventoryAlertStateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryAlertState to aggregate.
     */
    where?: InventoryAlertStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryAlertStates to fetch.
     */
    orderBy?: InventoryAlertStateOrderByWithRelationInput | InventoryAlertStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InventoryAlertStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryAlertStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryAlertStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InventoryAlertStates
    **/
    _count?: true | InventoryAlertStateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InventoryAlertStateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InventoryAlertStateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InventoryAlertStateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InventoryAlertStateMaxAggregateInputType
  }

  export type GetInventoryAlertStateAggregateType<T extends InventoryAlertStateAggregateArgs> = {
        [P in keyof T & keyof AggregateInventoryAlertState]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInventoryAlertState[P]>
      : GetScalarType<T[P], AggregateInventoryAlertState[P]>
  }




  export type InventoryAlertStateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryAlertStateWhereInput
    orderBy?: InventoryAlertStateOrderByWithAggregationInput | InventoryAlertStateOrderByWithAggregationInput[]
    by: InventoryAlertStateScalarFieldEnum[] | InventoryAlertStateScalarFieldEnum
    having?: InventoryAlertStateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InventoryAlertStateCountAggregateInputType | true
    _avg?: InventoryAlertStateAvgAggregateInputType
    _sum?: InventoryAlertStateSumAggregateInputType
    _min?: InventoryAlertStateMinAggregateInputType
    _max?: InventoryAlertStateMaxAggregateInputType
  }

  export type InventoryAlertStateGroupByOutputType = {
    id: string
    productId: string
    lowStockAlertSent: boolean
    outOfStockAlertSent: boolean
    lastKnownAvailableCount: number
    updatedAt: Date
    _count: InventoryAlertStateCountAggregateOutputType | null
    _avg: InventoryAlertStateAvgAggregateOutputType | null
    _sum: InventoryAlertStateSumAggregateOutputType | null
    _min: InventoryAlertStateMinAggregateOutputType | null
    _max: InventoryAlertStateMaxAggregateOutputType | null
  }

  type GetInventoryAlertStateGroupByPayload<T extends InventoryAlertStateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InventoryAlertStateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InventoryAlertStateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InventoryAlertStateGroupByOutputType[P]>
            : GetScalarType<T[P], InventoryAlertStateGroupByOutputType[P]>
        }
      >
    >


  export type InventoryAlertStateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    lowStockAlertSent?: boolean
    outOfStockAlertSent?: boolean
    lastKnownAvailableCount?: boolean
    updatedAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventoryAlertState"]>

  export type InventoryAlertStateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    lowStockAlertSent?: boolean
    outOfStockAlertSent?: boolean
    lastKnownAvailableCount?: boolean
    updatedAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventoryAlertState"]>

  export type InventoryAlertStateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    productId?: boolean
    lowStockAlertSent?: boolean
    outOfStockAlertSent?: boolean
    lastKnownAvailableCount?: boolean
    updatedAt?: boolean
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventoryAlertState"]>

  export type InventoryAlertStateSelectScalar = {
    id?: boolean
    productId?: boolean
    lowStockAlertSent?: boolean
    outOfStockAlertSent?: boolean
    lastKnownAvailableCount?: boolean
    updatedAt?: boolean
  }

  export type InventoryAlertStateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "productId" | "lowStockAlertSent" | "outOfStockAlertSent" | "lastKnownAvailableCount" | "updatedAt", ExtArgs["result"]["inventoryAlertState"]>
  export type InventoryAlertStateInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type InventoryAlertStateIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type InventoryAlertStateIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $InventoryAlertStatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InventoryAlertState"
    objects: {
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      productId: string
      lowStockAlertSent: boolean
      outOfStockAlertSent: boolean
      lastKnownAvailableCount: number
      updatedAt: Date
    }, ExtArgs["result"]["inventoryAlertState"]>
    composites: {}
  }

  type InventoryAlertStateGetPayload<S extends boolean | null | undefined | InventoryAlertStateDefaultArgs> = $Result.GetResult<Prisma.$InventoryAlertStatePayload, S>

  type InventoryAlertStateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InventoryAlertStateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InventoryAlertStateCountAggregateInputType | true
    }

  export interface InventoryAlertStateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InventoryAlertState'], meta: { name: 'InventoryAlertState' } }
    /**
     * Find zero or one InventoryAlertState that matches the filter.
     * @param {InventoryAlertStateFindUniqueArgs} args - Arguments to find a InventoryAlertState
     * @example
     * // Get one InventoryAlertState
     * const inventoryAlertState = await prisma.inventoryAlertState.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InventoryAlertStateFindUniqueArgs>(args: SelectSubset<T, InventoryAlertStateFindUniqueArgs<ExtArgs>>): Prisma__InventoryAlertStateClient<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one InventoryAlertState that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InventoryAlertStateFindUniqueOrThrowArgs} args - Arguments to find a InventoryAlertState
     * @example
     * // Get one InventoryAlertState
     * const inventoryAlertState = await prisma.inventoryAlertState.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InventoryAlertStateFindUniqueOrThrowArgs>(args: SelectSubset<T, InventoryAlertStateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InventoryAlertStateClient<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InventoryAlertState that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertStateFindFirstArgs} args - Arguments to find a InventoryAlertState
     * @example
     * // Get one InventoryAlertState
     * const inventoryAlertState = await prisma.inventoryAlertState.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InventoryAlertStateFindFirstArgs>(args?: SelectSubset<T, InventoryAlertStateFindFirstArgs<ExtArgs>>): Prisma__InventoryAlertStateClient<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InventoryAlertState that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertStateFindFirstOrThrowArgs} args - Arguments to find a InventoryAlertState
     * @example
     * // Get one InventoryAlertState
     * const inventoryAlertState = await prisma.inventoryAlertState.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InventoryAlertStateFindFirstOrThrowArgs>(args?: SelectSubset<T, InventoryAlertStateFindFirstOrThrowArgs<ExtArgs>>): Prisma__InventoryAlertStateClient<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more InventoryAlertStates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertStateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InventoryAlertStates
     * const inventoryAlertStates = await prisma.inventoryAlertState.findMany()
     * 
     * // Get first 10 InventoryAlertStates
     * const inventoryAlertStates = await prisma.inventoryAlertState.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inventoryAlertStateWithIdOnly = await prisma.inventoryAlertState.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InventoryAlertStateFindManyArgs>(args?: SelectSubset<T, InventoryAlertStateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a InventoryAlertState.
     * @param {InventoryAlertStateCreateArgs} args - Arguments to create a InventoryAlertState.
     * @example
     * // Create one InventoryAlertState
     * const InventoryAlertState = await prisma.inventoryAlertState.create({
     *   data: {
     *     // ... data to create a InventoryAlertState
     *   }
     * })
     * 
     */
    create<T extends InventoryAlertStateCreateArgs>(args: SelectSubset<T, InventoryAlertStateCreateArgs<ExtArgs>>): Prisma__InventoryAlertStateClient<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many InventoryAlertStates.
     * @param {InventoryAlertStateCreateManyArgs} args - Arguments to create many InventoryAlertStates.
     * @example
     * // Create many InventoryAlertStates
     * const inventoryAlertState = await prisma.inventoryAlertState.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InventoryAlertStateCreateManyArgs>(args?: SelectSubset<T, InventoryAlertStateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InventoryAlertStates and returns the data saved in the database.
     * @param {InventoryAlertStateCreateManyAndReturnArgs} args - Arguments to create many InventoryAlertStates.
     * @example
     * // Create many InventoryAlertStates
     * const inventoryAlertState = await prisma.inventoryAlertState.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InventoryAlertStates and only return the `id`
     * const inventoryAlertStateWithIdOnly = await prisma.inventoryAlertState.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InventoryAlertStateCreateManyAndReturnArgs>(args?: SelectSubset<T, InventoryAlertStateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a InventoryAlertState.
     * @param {InventoryAlertStateDeleteArgs} args - Arguments to delete one InventoryAlertState.
     * @example
     * // Delete one InventoryAlertState
     * const InventoryAlertState = await prisma.inventoryAlertState.delete({
     *   where: {
     *     // ... filter to delete one InventoryAlertState
     *   }
     * })
     * 
     */
    delete<T extends InventoryAlertStateDeleteArgs>(args: SelectSubset<T, InventoryAlertStateDeleteArgs<ExtArgs>>): Prisma__InventoryAlertStateClient<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one InventoryAlertState.
     * @param {InventoryAlertStateUpdateArgs} args - Arguments to update one InventoryAlertState.
     * @example
     * // Update one InventoryAlertState
     * const inventoryAlertState = await prisma.inventoryAlertState.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InventoryAlertStateUpdateArgs>(args: SelectSubset<T, InventoryAlertStateUpdateArgs<ExtArgs>>): Prisma__InventoryAlertStateClient<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more InventoryAlertStates.
     * @param {InventoryAlertStateDeleteManyArgs} args - Arguments to filter InventoryAlertStates to delete.
     * @example
     * // Delete a few InventoryAlertStates
     * const { count } = await prisma.inventoryAlertState.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InventoryAlertStateDeleteManyArgs>(args?: SelectSubset<T, InventoryAlertStateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InventoryAlertStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertStateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InventoryAlertStates
     * const inventoryAlertState = await prisma.inventoryAlertState.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InventoryAlertStateUpdateManyArgs>(args: SelectSubset<T, InventoryAlertStateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InventoryAlertStates and returns the data updated in the database.
     * @param {InventoryAlertStateUpdateManyAndReturnArgs} args - Arguments to update many InventoryAlertStates.
     * @example
     * // Update many InventoryAlertStates
     * const inventoryAlertState = await prisma.inventoryAlertState.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more InventoryAlertStates and only return the `id`
     * const inventoryAlertStateWithIdOnly = await prisma.inventoryAlertState.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InventoryAlertStateUpdateManyAndReturnArgs>(args: SelectSubset<T, InventoryAlertStateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one InventoryAlertState.
     * @param {InventoryAlertStateUpsertArgs} args - Arguments to update or create a InventoryAlertState.
     * @example
     * // Update or create a InventoryAlertState
     * const inventoryAlertState = await prisma.inventoryAlertState.upsert({
     *   create: {
     *     // ... data to create a InventoryAlertState
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InventoryAlertState we want to update
     *   }
     * })
     */
    upsert<T extends InventoryAlertStateUpsertArgs>(args: SelectSubset<T, InventoryAlertStateUpsertArgs<ExtArgs>>): Prisma__InventoryAlertStateClient<$Result.GetResult<Prisma.$InventoryAlertStatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of InventoryAlertStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertStateCountArgs} args - Arguments to filter InventoryAlertStates to count.
     * @example
     * // Count the number of InventoryAlertStates
     * const count = await prisma.inventoryAlertState.count({
     *   where: {
     *     // ... the filter for the InventoryAlertStates we want to count
     *   }
     * })
    **/
    count<T extends InventoryAlertStateCountArgs>(
      args?: Subset<T, InventoryAlertStateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InventoryAlertStateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InventoryAlertState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertStateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InventoryAlertStateAggregateArgs>(args: Subset<T, InventoryAlertStateAggregateArgs>): Prisma.PrismaPromise<GetInventoryAlertStateAggregateType<T>>

    /**
     * Group by InventoryAlertState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertStateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InventoryAlertStateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InventoryAlertStateGroupByArgs['orderBy'] }
        : { orderBy?: InventoryAlertStateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InventoryAlertStateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInventoryAlertStateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InventoryAlertState model
   */
  readonly fields: InventoryAlertStateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InventoryAlertState.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InventoryAlertStateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InventoryAlertState model
   */
  interface InventoryAlertStateFieldRefs {
    readonly id: FieldRef<"InventoryAlertState", 'String'>
    readonly productId: FieldRef<"InventoryAlertState", 'String'>
    readonly lowStockAlertSent: FieldRef<"InventoryAlertState", 'Boolean'>
    readonly outOfStockAlertSent: FieldRef<"InventoryAlertState", 'Boolean'>
    readonly lastKnownAvailableCount: FieldRef<"InventoryAlertState", 'Int'>
    readonly updatedAt: FieldRef<"InventoryAlertState", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InventoryAlertState findUnique
   */
  export type InventoryAlertStateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateInclude<ExtArgs> | null
    /**
     * Filter, which InventoryAlertState to fetch.
     */
    where: InventoryAlertStateWhereUniqueInput
  }

  /**
   * InventoryAlertState findUniqueOrThrow
   */
  export type InventoryAlertStateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateInclude<ExtArgs> | null
    /**
     * Filter, which InventoryAlertState to fetch.
     */
    where: InventoryAlertStateWhereUniqueInput
  }

  /**
   * InventoryAlertState findFirst
   */
  export type InventoryAlertStateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateInclude<ExtArgs> | null
    /**
     * Filter, which InventoryAlertState to fetch.
     */
    where?: InventoryAlertStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryAlertStates to fetch.
     */
    orderBy?: InventoryAlertStateOrderByWithRelationInput | InventoryAlertStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryAlertStates.
     */
    cursor?: InventoryAlertStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryAlertStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryAlertStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryAlertStates.
     */
    distinct?: InventoryAlertStateScalarFieldEnum | InventoryAlertStateScalarFieldEnum[]
  }

  /**
   * InventoryAlertState findFirstOrThrow
   */
  export type InventoryAlertStateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateInclude<ExtArgs> | null
    /**
     * Filter, which InventoryAlertState to fetch.
     */
    where?: InventoryAlertStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryAlertStates to fetch.
     */
    orderBy?: InventoryAlertStateOrderByWithRelationInput | InventoryAlertStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryAlertStates.
     */
    cursor?: InventoryAlertStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryAlertStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryAlertStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryAlertStates.
     */
    distinct?: InventoryAlertStateScalarFieldEnum | InventoryAlertStateScalarFieldEnum[]
  }

  /**
   * InventoryAlertState findMany
   */
  export type InventoryAlertStateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateInclude<ExtArgs> | null
    /**
     * Filter, which InventoryAlertStates to fetch.
     */
    where?: InventoryAlertStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryAlertStates to fetch.
     */
    orderBy?: InventoryAlertStateOrderByWithRelationInput | InventoryAlertStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InventoryAlertStates.
     */
    cursor?: InventoryAlertStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryAlertStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryAlertStates.
     */
    skip?: number
    distinct?: InventoryAlertStateScalarFieldEnum | InventoryAlertStateScalarFieldEnum[]
  }

  /**
   * InventoryAlertState create
   */
  export type InventoryAlertStateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateInclude<ExtArgs> | null
    /**
     * The data needed to create a InventoryAlertState.
     */
    data: XOR<InventoryAlertStateCreateInput, InventoryAlertStateUncheckedCreateInput>
  }

  /**
   * InventoryAlertState createMany
   */
  export type InventoryAlertStateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InventoryAlertStates.
     */
    data: InventoryAlertStateCreateManyInput | InventoryAlertStateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InventoryAlertState createManyAndReturn
   */
  export type InventoryAlertStateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * The data used to create many InventoryAlertStates.
     */
    data: InventoryAlertStateCreateManyInput | InventoryAlertStateCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InventoryAlertState update
   */
  export type InventoryAlertStateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateInclude<ExtArgs> | null
    /**
     * The data needed to update a InventoryAlertState.
     */
    data: XOR<InventoryAlertStateUpdateInput, InventoryAlertStateUncheckedUpdateInput>
    /**
     * Choose, which InventoryAlertState to update.
     */
    where: InventoryAlertStateWhereUniqueInput
  }

  /**
   * InventoryAlertState updateMany
   */
  export type InventoryAlertStateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InventoryAlertStates.
     */
    data: XOR<InventoryAlertStateUpdateManyMutationInput, InventoryAlertStateUncheckedUpdateManyInput>
    /**
     * Filter which InventoryAlertStates to update
     */
    where?: InventoryAlertStateWhereInput
    /**
     * Limit how many InventoryAlertStates to update.
     */
    limit?: number
  }

  /**
   * InventoryAlertState updateManyAndReturn
   */
  export type InventoryAlertStateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * The data used to update InventoryAlertStates.
     */
    data: XOR<InventoryAlertStateUpdateManyMutationInput, InventoryAlertStateUncheckedUpdateManyInput>
    /**
     * Filter which InventoryAlertStates to update
     */
    where?: InventoryAlertStateWhereInput
    /**
     * Limit how many InventoryAlertStates to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * InventoryAlertState upsert
   */
  export type InventoryAlertStateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateInclude<ExtArgs> | null
    /**
     * The filter to search for the InventoryAlertState to update in case it exists.
     */
    where: InventoryAlertStateWhereUniqueInput
    /**
     * In case the InventoryAlertState found by the `where` argument doesn't exist, create a new InventoryAlertState with this data.
     */
    create: XOR<InventoryAlertStateCreateInput, InventoryAlertStateUncheckedCreateInput>
    /**
     * In case the InventoryAlertState was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InventoryAlertStateUpdateInput, InventoryAlertStateUncheckedUpdateInput>
  }

  /**
   * InventoryAlertState delete
   */
  export type InventoryAlertStateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateInclude<ExtArgs> | null
    /**
     * Filter which InventoryAlertState to delete.
     */
    where: InventoryAlertStateWhereUniqueInput
  }

  /**
   * InventoryAlertState deleteMany
   */
  export type InventoryAlertStateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryAlertStates to delete
     */
    where?: InventoryAlertStateWhereInput
    /**
     * Limit how many InventoryAlertStates to delete.
     */
    limit?: number
  }

  /**
   * InventoryAlertState without action
   */
  export type InventoryAlertStateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlertState
     */
    select?: InventoryAlertStateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InventoryAlertState
     */
    omit?: InventoryAlertStateOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryAlertStateInclude<ExtArgs> | null
  }


  /**
   * Model SystemSetting
   */

  export type AggregateSystemSetting = {
    _count: SystemSettingCountAggregateOutputType | null
    _min: SystemSettingMinAggregateOutputType | null
    _max: SystemSettingMaxAggregateOutputType | null
  }

  export type SystemSettingMinAggregateOutputType = {
    id: string | null
    key: string | null
    value: string | null
    isSecret: boolean | null
    updatedAt: Date | null
  }

  export type SystemSettingMaxAggregateOutputType = {
    id: string | null
    key: string | null
    value: string | null
    isSecret: boolean | null
    updatedAt: Date | null
  }

  export type SystemSettingCountAggregateOutputType = {
    id: number
    key: number
    value: number
    isSecret: number
    updatedAt: number
    _all: number
  }


  export type SystemSettingMinAggregateInputType = {
    id?: true
    key?: true
    value?: true
    isSecret?: true
    updatedAt?: true
  }

  export type SystemSettingMaxAggregateInputType = {
    id?: true
    key?: true
    value?: true
    isSecret?: true
    updatedAt?: true
  }

  export type SystemSettingCountAggregateInputType = {
    id?: true
    key?: true
    value?: true
    isSecret?: true
    updatedAt?: true
    _all?: true
  }

  export type SystemSettingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemSetting to aggregate.
     */
    where?: SystemSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemSettings to fetch.
     */
    orderBy?: SystemSettingOrderByWithRelationInput | SystemSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SystemSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SystemSettings
    **/
    _count?: true | SystemSettingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SystemSettingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SystemSettingMaxAggregateInputType
  }

  export type GetSystemSettingAggregateType<T extends SystemSettingAggregateArgs> = {
        [P in keyof T & keyof AggregateSystemSetting]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSystemSetting[P]>
      : GetScalarType<T[P], AggregateSystemSetting[P]>
  }




  export type SystemSettingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemSettingWhereInput
    orderBy?: SystemSettingOrderByWithAggregationInput | SystemSettingOrderByWithAggregationInput[]
    by: SystemSettingScalarFieldEnum[] | SystemSettingScalarFieldEnum
    having?: SystemSettingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SystemSettingCountAggregateInputType | true
    _min?: SystemSettingMinAggregateInputType
    _max?: SystemSettingMaxAggregateInputType
  }

  export type SystemSettingGroupByOutputType = {
    id: string
    key: string
    value: string
    isSecret: boolean
    updatedAt: Date
    _count: SystemSettingCountAggregateOutputType | null
    _min: SystemSettingMinAggregateOutputType | null
    _max: SystemSettingMaxAggregateOutputType | null
  }

  type GetSystemSettingGroupByPayload<T extends SystemSettingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SystemSettingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SystemSettingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SystemSettingGroupByOutputType[P]>
            : GetScalarType<T[P], SystemSettingGroupByOutputType[P]>
        }
      >
    >


  export type SystemSettingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    value?: boolean
    isSecret?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["systemSetting"]>

  export type SystemSettingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    value?: boolean
    isSecret?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["systemSetting"]>

  export type SystemSettingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    key?: boolean
    value?: boolean
    isSecret?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["systemSetting"]>

  export type SystemSettingSelectScalar = {
    id?: boolean
    key?: boolean
    value?: boolean
    isSecret?: boolean
    updatedAt?: boolean
  }

  export type SystemSettingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "key" | "value" | "isSecret" | "updatedAt", ExtArgs["result"]["systemSetting"]>

  export type $SystemSettingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SystemSetting"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      key: string
      value: string
      isSecret: boolean
      updatedAt: Date
    }, ExtArgs["result"]["systemSetting"]>
    composites: {}
  }

  type SystemSettingGetPayload<S extends boolean | null | undefined | SystemSettingDefaultArgs> = $Result.GetResult<Prisma.$SystemSettingPayload, S>

  type SystemSettingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SystemSettingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SystemSettingCountAggregateInputType | true
    }

  export interface SystemSettingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SystemSetting'], meta: { name: 'SystemSetting' } }
    /**
     * Find zero or one SystemSetting that matches the filter.
     * @param {SystemSettingFindUniqueArgs} args - Arguments to find a SystemSetting
     * @example
     * // Get one SystemSetting
     * const systemSetting = await prisma.systemSetting.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SystemSettingFindUniqueArgs>(args: SelectSubset<T, SystemSettingFindUniqueArgs<ExtArgs>>): Prisma__SystemSettingClient<$Result.GetResult<Prisma.$SystemSettingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SystemSetting that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SystemSettingFindUniqueOrThrowArgs} args - Arguments to find a SystemSetting
     * @example
     * // Get one SystemSetting
     * const systemSetting = await prisma.systemSetting.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SystemSettingFindUniqueOrThrowArgs>(args: SelectSubset<T, SystemSettingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SystemSettingClient<$Result.GetResult<Prisma.$SystemSettingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SystemSetting that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemSettingFindFirstArgs} args - Arguments to find a SystemSetting
     * @example
     * // Get one SystemSetting
     * const systemSetting = await prisma.systemSetting.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SystemSettingFindFirstArgs>(args?: SelectSubset<T, SystemSettingFindFirstArgs<ExtArgs>>): Prisma__SystemSettingClient<$Result.GetResult<Prisma.$SystemSettingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SystemSetting that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemSettingFindFirstOrThrowArgs} args - Arguments to find a SystemSetting
     * @example
     * // Get one SystemSetting
     * const systemSetting = await prisma.systemSetting.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SystemSettingFindFirstOrThrowArgs>(args?: SelectSubset<T, SystemSettingFindFirstOrThrowArgs<ExtArgs>>): Prisma__SystemSettingClient<$Result.GetResult<Prisma.$SystemSettingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SystemSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemSettingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SystemSettings
     * const systemSettings = await prisma.systemSetting.findMany()
     * 
     * // Get first 10 SystemSettings
     * const systemSettings = await prisma.systemSetting.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const systemSettingWithIdOnly = await prisma.systemSetting.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SystemSettingFindManyArgs>(args?: SelectSubset<T, SystemSettingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemSettingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SystemSetting.
     * @param {SystemSettingCreateArgs} args - Arguments to create a SystemSetting.
     * @example
     * // Create one SystemSetting
     * const SystemSetting = await prisma.systemSetting.create({
     *   data: {
     *     // ... data to create a SystemSetting
     *   }
     * })
     * 
     */
    create<T extends SystemSettingCreateArgs>(args: SelectSubset<T, SystemSettingCreateArgs<ExtArgs>>): Prisma__SystemSettingClient<$Result.GetResult<Prisma.$SystemSettingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SystemSettings.
     * @param {SystemSettingCreateManyArgs} args - Arguments to create many SystemSettings.
     * @example
     * // Create many SystemSettings
     * const systemSetting = await prisma.systemSetting.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SystemSettingCreateManyArgs>(args?: SelectSubset<T, SystemSettingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SystemSettings and returns the data saved in the database.
     * @param {SystemSettingCreateManyAndReturnArgs} args - Arguments to create many SystemSettings.
     * @example
     * // Create many SystemSettings
     * const systemSetting = await prisma.systemSetting.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SystemSettings and only return the `id`
     * const systemSettingWithIdOnly = await prisma.systemSetting.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SystemSettingCreateManyAndReturnArgs>(args?: SelectSubset<T, SystemSettingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemSettingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SystemSetting.
     * @param {SystemSettingDeleteArgs} args - Arguments to delete one SystemSetting.
     * @example
     * // Delete one SystemSetting
     * const SystemSetting = await prisma.systemSetting.delete({
     *   where: {
     *     // ... filter to delete one SystemSetting
     *   }
     * })
     * 
     */
    delete<T extends SystemSettingDeleteArgs>(args: SelectSubset<T, SystemSettingDeleteArgs<ExtArgs>>): Prisma__SystemSettingClient<$Result.GetResult<Prisma.$SystemSettingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SystemSetting.
     * @param {SystemSettingUpdateArgs} args - Arguments to update one SystemSetting.
     * @example
     * // Update one SystemSetting
     * const systemSetting = await prisma.systemSetting.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SystemSettingUpdateArgs>(args: SelectSubset<T, SystemSettingUpdateArgs<ExtArgs>>): Prisma__SystemSettingClient<$Result.GetResult<Prisma.$SystemSettingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SystemSettings.
     * @param {SystemSettingDeleteManyArgs} args - Arguments to filter SystemSettings to delete.
     * @example
     * // Delete a few SystemSettings
     * const { count } = await prisma.systemSetting.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SystemSettingDeleteManyArgs>(args?: SelectSubset<T, SystemSettingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemSettingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SystemSettings
     * const systemSetting = await prisma.systemSetting.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SystemSettingUpdateManyArgs>(args: SelectSubset<T, SystemSettingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemSettings and returns the data updated in the database.
     * @param {SystemSettingUpdateManyAndReturnArgs} args - Arguments to update many SystemSettings.
     * @example
     * // Update many SystemSettings
     * const systemSetting = await prisma.systemSetting.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SystemSettings and only return the `id`
     * const systemSettingWithIdOnly = await prisma.systemSetting.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SystemSettingUpdateManyAndReturnArgs>(args: SelectSubset<T, SystemSettingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemSettingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SystemSetting.
     * @param {SystemSettingUpsertArgs} args - Arguments to update or create a SystemSetting.
     * @example
     * // Update or create a SystemSetting
     * const systemSetting = await prisma.systemSetting.upsert({
     *   create: {
     *     // ... data to create a SystemSetting
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SystemSetting we want to update
     *   }
     * })
     */
    upsert<T extends SystemSettingUpsertArgs>(args: SelectSubset<T, SystemSettingUpsertArgs<ExtArgs>>): Prisma__SystemSettingClient<$Result.GetResult<Prisma.$SystemSettingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SystemSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemSettingCountArgs} args - Arguments to filter SystemSettings to count.
     * @example
     * // Count the number of SystemSettings
     * const count = await prisma.systemSetting.count({
     *   where: {
     *     // ... the filter for the SystemSettings we want to count
     *   }
     * })
    **/
    count<T extends SystemSettingCountArgs>(
      args?: Subset<T, SystemSettingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SystemSettingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SystemSetting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemSettingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SystemSettingAggregateArgs>(args: Subset<T, SystemSettingAggregateArgs>): Prisma.PrismaPromise<GetSystemSettingAggregateType<T>>

    /**
     * Group by SystemSetting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemSettingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SystemSettingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SystemSettingGroupByArgs['orderBy'] }
        : { orderBy?: SystemSettingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SystemSettingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSystemSettingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SystemSetting model
   */
  readonly fields: SystemSettingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SystemSetting.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SystemSettingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SystemSetting model
   */
  interface SystemSettingFieldRefs {
    readonly id: FieldRef<"SystemSetting", 'String'>
    readonly key: FieldRef<"SystemSetting", 'String'>
    readonly value: FieldRef<"SystemSetting", 'String'>
    readonly isSecret: FieldRef<"SystemSetting", 'Boolean'>
    readonly updatedAt: FieldRef<"SystemSetting", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SystemSetting findUnique
   */
  export type SystemSettingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
    /**
     * Filter, which SystemSetting to fetch.
     */
    where: SystemSettingWhereUniqueInput
  }

  /**
   * SystemSetting findUniqueOrThrow
   */
  export type SystemSettingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
    /**
     * Filter, which SystemSetting to fetch.
     */
    where: SystemSettingWhereUniqueInput
  }

  /**
   * SystemSetting findFirst
   */
  export type SystemSettingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
    /**
     * Filter, which SystemSetting to fetch.
     */
    where?: SystemSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemSettings to fetch.
     */
    orderBy?: SystemSettingOrderByWithRelationInput | SystemSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemSettings.
     */
    cursor?: SystemSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemSettings.
     */
    distinct?: SystemSettingScalarFieldEnum | SystemSettingScalarFieldEnum[]
  }

  /**
   * SystemSetting findFirstOrThrow
   */
  export type SystemSettingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
    /**
     * Filter, which SystemSetting to fetch.
     */
    where?: SystemSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemSettings to fetch.
     */
    orderBy?: SystemSettingOrderByWithRelationInput | SystemSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemSettings.
     */
    cursor?: SystemSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemSettings.
     */
    distinct?: SystemSettingScalarFieldEnum | SystemSettingScalarFieldEnum[]
  }

  /**
   * SystemSetting findMany
   */
  export type SystemSettingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
    /**
     * Filter, which SystemSettings to fetch.
     */
    where?: SystemSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemSettings to fetch.
     */
    orderBy?: SystemSettingOrderByWithRelationInput | SystemSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SystemSettings.
     */
    cursor?: SystemSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemSettings.
     */
    skip?: number
    distinct?: SystemSettingScalarFieldEnum | SystemSettingScalarFieldEnum[]
  }

  /**
   * SystemSetting create
   */
  export type SystemSettingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
    /**
     * The data needed to create a SystemSetting.
     */
    data: XOR<SystemSettingCreateInput, SystemSettingUncheckedCreateInput>
  }

  /**
   * SystemSetting createMany
   */
  export type SystemSettingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SystemSettings.
     */
    data: SystemSettingCreateManyInput | SystemSettingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemSetting createManyAndReturn
   */
  export type SystemSettingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
    /**
     * The data used to create many SystemSettings.
     */
    data: SystemSettingCreateManyInput | SystemSettingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemSetting update
   */
  export type SystemSettingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
    /**
     * The data needed to update a SystemSetting.
     */
    data: XOR<SystemSettingUpdateInput, SystemSettingUncheckedUpdateInput>
    /**
     * Choose, which SystemSetting to update.
     */
    where: SystemSettingWhereUniqueInput
  }

  /**
   * SystemSetting updateMany
   */
  export type SystemSettingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SystemSettings.
     */
    data: XOR<SystemSettingUpdateManyMutationInput, SystemSettingUncheckedUpdateManyInput>
    /**
     * Filter which SystemSettings to update
     */
    where?: SystemSettingWhereInput
    /**
     * Limit how many SystemSettings to update.
     */
    limit?: number
  }

  /**
   * SystemSetting updateManyAndReturn
   */
  export type SystemSettingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
    /**
     * The data used to update SystemSettings.
     */
    data: XOR<SystemSettingUpdateManyMutationInput, SystemSettingUncheckedUpdateManyInput>
    /**
     * Filter which SystemSettings to update
     */
    where?: SystemSettingWhereInput
    /**
     * Limit how many SystemSettings to update.
     */
    limit?: number
  }

  /**
   * SystemSetting upsert
   */
  export type SystemSettingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
    /**
     * The filter to search for the SystemSetting to update in case it exists.
     */
    where: SystemSettingWhereUniqueInput
    /**
     * In case the SystemSetting found by the `where` argument doesn't exist, create a new SystemSetting with this data.
     */
    create: XOR<SystemSettingCreateInput, SystemSettingUncheckedCreateInput>
    /**
     * In case the SystemSetting was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SystemSettingUpdateInput, SystemSettingUncheckedUpdateInput>
  }

  /**
   * SystemSetting delete
   */
  export type SystemSettingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
    /**
     * Filter which SystemSetting to delete.
     */
    where: SystemSettingWhereUniqueInput
  }

  /**
   * SystemSetting deleteMany
   */
  export type SystemSettingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemSettings to delete
     */
    where?: SystemSettingWhereInput
    /**
     * Limit how many SystemSettings to delete.
     */
    limit?: number
  }

  /**
   * SystemSetting without action
   */
  export type SystemSettingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemSetting
     */
    select?: SystemSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemSetting
     */
    omit?: SystemSettingOmit<ExtArgs> | null
  }


  /**
   * Model DiscordAlertLog
   */

  export type AggregateDiscordAlertLog = {
    _count: DiscordAlertLogCountAggregateOutputType | null
    _min: DiscordAlertLogMinAggregateOutputType | null
    _max: DiscordAlertLogMaxAggregateOutputType | null
  }

  export type DiscordAlertLogMinAggregateOutputType = {
    id: string | null
    alertType: string | null
    dedupeKey: string | null
    sentAt: Date | null
  }

  export type DiscordAlertLogMaxAggregateOutputType = {
    id: string | null
    alertType: string | null
    dedupeKey: string | null
    sentAt: Date | null
  }

  export type DiscordAlertLogCountAggregateOutputType = {
    id: number
    alertType: number
    dedupeKey: number
    payload: number
    sentAt: number
    _all: number
  }


  export type DiscordAlertLogMinAggregateInputType = {
    id?: true
    alertType?: true
    dedupeKey?: true
    sentAt?: true
  }

  export type DiscordAlertLogMaxAggregateInputType = {
    id?: true
    alertType?: true
    dedupeKey?: true
    sentAt?: true
  }

  export type DiscordAlertLogCountAggregateInputType = {
    id?: true
    alertType?: true
    dedupeKey?: true
    payload?: true
    sentAt?: true
    _all?: true
  }

  export type DiscordAlertLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DiscordAlertLog to aggregate.
     */
    where?: DiscordAlertLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiscordAlertLogs to fetch.
     */
    orderBy?: DiscordAlertLogOrderByWithRelationInput | DiscordAlertLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DiscordAlertLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiscordAlertLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiscordAlertLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DiscordAlertLogs
    **/
    _count?: true | DiscordAlertLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DiscordAlertLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DiscordAlertLogMaxAggregateInputType
  }

  export type GetDiscordAlertLogAggregateType<T extends DiscordAlertLogAggregateArgs> = {
        [P in keyof T & keyof AggregateDiscordAlertLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDiscordAlertLog[P]>
      : GetScalarType<T[P], AggregateDiscordAlertLog[P]>
  }




  export type DiscordAlertLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DiscordAlertLogWhereInput
    orderBy?: DiscordAlertLogOrderByWithAggregationInput | DiscordAlertLogOrderByWithAggregationInput[]
    by: DiscordAlertLogScalarFieldEnum[] | DiscordAlertLogScalarFieldEnum
    having?: DiscordAlertLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DiscordAlertLogCountAggregateInputType | true
    _min?: DiscordAlertLogMinAggregateInputType
    _max?: DiscordAlertLogMaxAggregateInputType
  }

  export type DiscordAlertLogGroupByOutputType = {
    id: string
    alertType: string
    dedupeKey: string
    payload: JsonValue
    sentAt: Date
    _count: DiscordAlertLogCountAggregateOutputType | null
    _min: DiscordAlertLogMinAggregateOutputType | null
    _max: DiscordAlertLogMaxAggregateOutputType | null
  }

  type GetDiscordAlertLogGroupByPayload<T extends DiscordAlertLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DiscordAlertLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DiscordAlertLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DiscordAlertLogGroupByOutputType[P]>
            : GetScalarType<T[P], DiscordAlertLogGroupByOutputType[P]>
        }
      >
    >


  export type DiscordAlertLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    alertType?: boolean
    dedupeKey?: boolean
    payload?: boolean
    sentAt?: boolean
  }, ExtArgs["result"]["discordAlertLog"]>

  export type DiscordAlertLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    alertType?: boolean
    dedupeKey?: boolean
    payload?: boolean
    sentAt?: boolean
  }, ExtArgs["result"]["discordAlertLog"]>

  export type DiscordAlertLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    alertType?: boolean
    dedupeKey?: boolean
    payload?: boolean
    sentAt?: boolean
  }, ExtArgs["result"]["discordAlertLog"]>

  export type DiscordAlertLogSelectScalar = {
    id?: boolean
    alertType?: boolean
    dedupeKey?: boolean
    payload?: boolean
    sentAt?: boolean
  }

  export type DiscordAlertLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "alertType" | "dedupeKey" | "payload" | "sentAt", ExtArgs["result"]["discordAlertLog"]>

  export type $DiscordAlertLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DiscordAlertLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      alertType: string
      dedupeKey: string
      payload: Prisma.JsonValue
      sentAt: Date
    }, ExtArgs["result"]["discordAlertLog"]>
    composites: {}
  }

  type DiscordAlertLogGetPayload<S extends boolean | null | undefined | DiscordAlertLogDefaultArgs> = $Result.GetResult<Prisma.$DiscordAlertLogPayload, S>

  type DiscordAlertLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DiscordAlertLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DiscordAlertLogCountAggregateInputType | true
    }

  export interface DiscordAlertLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DiscordAlertLog'], meta: { name: 'DiscordAlertLog' } }
    /**
     * Find zero or one DiscordAlertLog that matches the filter.
     * @param {DiscordAlertLogFindUniqueArgs} args - Arguments to find a DiscordAlertLog
     * @example
     * // Get one DiscordAlertLog
     * const discordAlertLog = await prisma.discordAlertLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DiscordAlertLogFindUniqueArgs>(args: SelectSubset<T, DiscordAlertLogFindUniqueArgs<ExtArgs>>): Prisma__DiscordAlertLogClient<$Result.GetResult<Prisma.$DiscordAlertLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DiscordAlertLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DiscordAlertLogFindUniqueOrThrowArgs} args - Arguments to find a DiscordAlertLog
     * @example
     * // Get one DiscordAlertLog
     * const discordAlertLog = await prisma.discordAlertLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DiscordAlertLogFindUniqueOrThrowArgs>(args: SelectSubset<T, DiscordAlertLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DiscordAlertLogClient<$Result.GetResult<Prisma.$DiscordAlertLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DiscordAlertLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordAlertLogFindFirstArgs} args - Arguments to find a DiscordAlertLog
     * @example
     * // Get one DiscordAlertLog
     * const discordAlertLog = await prisma.discordAlertLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DiscordAlertLogFindFirstArgs>(args?: SelectSubset<T, DiscordAlertLogFindFirstArgs<ExtArgs>>): Prisma__DiscordAlertLogClient<$Result.GetResult<Prisma.$DiscordAlertLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DiscordAlertLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordAlertLogFindFirstOrThrowArgs} args - Arguments to find a DiscordAlertLog
     * @example
     * // Get one DiscordAlertLog
     * const discordAlertLog = await prisma.discordAlertLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DiscordAlertLogFindFirstOrThrowArgs>(args?: SelectSubset<T, DiscordAlertLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__DiscordAlertLogClient<$Result.GetResult<Prisma.$DiscordAlertLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DiscordAlertLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordAlertLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DiscordAlertLogs
     * const discordAlertLogs = await prisma.discordAlertLog.findMany()
     * 
     * // Get first 10 DiscordAlertLogs
     * const discordAlertLogs = await prisma.discordAlertLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const discordAlertLogWithIdOnly = await prisma.discordAlertLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DiscordAlertLogFindManyArgs>(args?: SelectSubset<T, DiscordAlertLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiscordAlertLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DiscordAlertLog.
     * @param {DiscordAlertLogCreateArgs} args - Arguments to create a DiscordAlertLog.
     * @example
     * // Create one DiscordAlertLog
     * const DiscordAlertLog = await prisma.discordAlertLog.create({
     *   data: {
     *     // ... data to create a DiscordAlertLog
     *   }
     * })
     * 
     */
    create<T extends DiscordAlertLogCreateArgs>(args: SelectSubset<T, DiscordAlertLogCreateArgs<ExtArgs>>): Prisma__DiscordAlertLogClient<$Result.GetResult<Prisma.$DiscordAlertLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DiscordAlertLogs.
     * @param {DiscordAlertLogCreateManyArgs} args - Arguments to create many DiscordAlertLogs.
     * @example
     * // Create many DiscordAlertLogs
     * const discordAlertLog = await prisma.discordAlertLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DiscordAlertLogCreateManyArgs>(args?: SelectSubset<T, DiscordAlertLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DiscordAlertLogs and returns the data saved in the database.
     * @param {DiscordAlertLogCreateManyAndReturnArgs} args - Arguments to create many DiscordAlertLogs.
     * @example
     * // Create many DiscordAlertLogs
     * const discordAlertLog = await prisma.discordAlertLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DiscordAlertLogs and only return the `id`
     * const discordAlertLogWithIdOnly = await prisma.discordAlertLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DiscordAlertLogCreateManyAndReturnArgs>(args?: SelectSubset<T, DiscordAlertLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiscordAlertLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DiscordAlertLog.
     * @param {DiscordAlertLogDeleteArgs} args - Arguments to delete one DiscordAlertLog.
     * @example
     * // Delete one DiscordAlertLog
     * const DiscordAlertLog = await prisma.discordAlertLog.delete({
     *   where: {
     *     // ... filter to delete one DiscordAlertLog
     *   }
     * })
     * 
     */
    delete<T extends DiscordAlertLogDeleteArgs>(args: SelectSubset<T, DiscordAlertLogDeleteArgs<ExtArgs>>): Prisma__DiscordAlertLogClient<$Result.GetResult<Prisma.$DiscordAlertLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DiscordAlertLog.
     * @param {DiscordAlertLogUpdateArgs} args - Arguments to update one DiscordAlertLog.
     * @example
     * // Update one DiscordAlertLog
     * const discordAlertLog = await prisma.discordAlertLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DiscordAlertLogUpdateArgs>(args: SelectSubset<T, DiscordAlertLogUpdateArgs<ExtArgs>>): Prisma__DiscordAlertLogClient<$Result.GetResult<Prisma.$DiscordAlertLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DiscordAlertLogs.
     * @param {DiscordAlertLogDeleteManyArgs} args - Arguments to filter DiscordAlertLogs to delete.
     * @example
     * // Delete a few DiscordAlertLogs
     * const { count } = await prisma.discordAlertLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DiscordAlertLogDeleteManyArgs>(args?: SelectSubset<T, DiscordAlertLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DiscordAlertLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordAlertLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DiscordAlertLogs
     * const discordAlertLog = await prisma.discordAlertLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DiscordAlertLogUpdateManyArgs>(args: SelectSubset<T, DiscordAlertLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DiscordAlertLogs and returns the data updated in the database.
     * @param {DiscordAlertLogUpdateManyAndReturnArgs} args - Arguments to update many DiscordAlertLogs.
     * @example
     * // Update many DiscordAlertLogs
     * const discordAlertLog = await prisma.discordAlertLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DiscordAlertLogs and only return the `id`
     * const discordAlertLogWithIdOnly = await prisma.discordAlertLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DiscordAlertLogUpdateManyAndReturnArgs>(args: SelectSubset<T, DiscordAlertLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DiscordAlertLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DiscordAlertLog.
     * @param {DiscordAlertLogUpsertArgs} args - Arguments to update or create a DiscordAlertLog.
     * @example
     * // Update or create a DiscordAlertLog
     * const discordAlertLog = await prisma.discordAlertLog.upsert({
     *   create: {
     *     // ... data to create a DiscordAlertLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DiscordAlertLog we want to update
     *   }
     * })
     */
    upsert<T extends DiscordAlertLogUpsertArgs>(args: SelectSubset<T, DiscordAlertLogUpsertArgs<ExtArgs>>): Prisma__DiscordAlertLogClient<$Result.GetResult<Prisma.$DiscordAlertLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DiscordAlertLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordAlertLogCountArgs} args - Arguments to filter DiscordAlertLogs to count.
     * @example
     * // Count the number of DiscordAlertLogs
     * const count = await prisma.discordAlertLog.count({
     *   where: {
     *     // ... the filter for the DiscordAlertLogs we want to count
     *   }
     * })
    **/
    count<T extends DiscordAlertLogCountArgs>(
      args?: Subset<T, DiscordAlertLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DiscordAlertLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DiscordAlertLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordAlertLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DiscordAlertLogAggregateArgs>(args: Subset<T, DiscordAlertLogAggregateArgs>): Prisma.PrismaPromise<GetDiscordAlertLogAggregateType<T>>

    /**
     * Group by DiscordAlertLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DiscordAlertLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DiscordAlertLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DiscordAlertLogGroupByArgs['orderBy'] }
        : { orderBy?: DiscordAlertLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DiscordAlertLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDiscordAlertLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DiscordAlertLog model
   */
  readonly fields: DiscordAlertLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DiscordAlertLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DiscordAlertLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DiscordAlertLog model
   */
  interface DiscordAlertLogFieldRefs {
    readonly id: FieldRef<"DiscordAlertLog", 'String'>
    readonly alertType: FieldRef<"DiscordAlertLog", 'String'>
    readonly dedupeKey: FieldRef<"DiscordAlertLog", 'String'>
    readonly payload: FieldRef<"DiscordAlertLog", 'Json'>
    readonly sentAt: FieldRef<"DiscordAlertLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DiscordAlertLog findUnique
   */
  export type DiscordAlertLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
    /**
     * Filter, which DiscordAlertLog to fetch.
     */
    where: DiscordAlertLogWhereUniqueInput
  }

  /**
   * DiscordAlertLog findUniqueOrThrow
   */
  export type DiscordAlertLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
    /**
     * Filter, which DiscordAlertLog to fetch.
     */
    where: DiscordAlertLogWhereUniqueInput
  }

  /**
   * DiscordAlertLog findFirst
   */
  export type DiscordAlertLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
    /**
     * Filter, which DiscordAlertLog to fetch.
     */
    where?: DiscordAlertLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiscordAlertLogs to fetch.
     */
    orderBy?: DiscordAlertLogOrderByWithRelationInput | DiscordAlertLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DiscordAlertLogs.
     */
    cursor?: DiscordAlertLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiscordAlertLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiscordAlertLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DiscordAlertLogs.
     */
    distinct?: DiscordAlertLogScalarFieldEnum | DiscordAlertLogScalarFieldEnum[]
  }

  /**
   * DiscordAlertLog findFirstOrThrow
   */
  export type DiscordAlertLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
    /**
     * Filter, which DiscordAlertLog to fetch.
     */
    where?: DiscordAlertLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiscordAlertLogs to fetch.
     */
    orderBy?: DiscordAlertLogOrderByWithRelationInput | DiscordAlertLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DiscordAlertLogs.
     */
    cursor?: DiscordAlertLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiscordAlertLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiscordAlertLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DiscordAlertLogs.
     */
    distinct?: DiscordAlertLogScalarFieldEnum | DiscordAlertLogScalarFieldEnum[]
  }

  /**
   * DiscordAlertLog findMany
   */
  export type DiscordAlertLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
    /**
     * Filter, which DiscordAlertLogs to fetch.
     */
    where?: DiscordAlertLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DiscordAlertLogs to fetch.
     */
    orderBy?: DiscordAlertLogOrderByWithRelationInput | DiscordAlertLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DiscordAlertLogs.
     */
    cursor?: DiscordAlertLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DiscordAlertLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DiscordAlertLogs.
     */
    skip?: number
    distinct?: DiscordAlertLogScalarFieldEnum | DiscordAlertLogScalarFieldEnum[]
  }

  /**
   * DiscordAlertLog create
   */
  export type DiscordAlertLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
    /**
     * The data needed to create a DiscordAlertLog.
     */
    data: XOR<DiscordAlertLogCreateInput, DiscordAlertLogUncheckedCreateInput>
  }

  /**
   * DiscordAlertLog createMany
   */
  export type DiscordAlertLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DiscordAlertLogs.
     */
    data: DiscordAlertLogCreateManyInput | DiscordAlertLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DiscordAlertLog createManyAndReturn
   */
  export type DiscordAlertLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
    /**
     * The data used to create many DiscordAlertLogs.
     */
    data: DiscordAlertLogCreateManyInput | DiscordAlertLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DiscordAlertLog update
   */
  export type DiscordAlertLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
    /**
     * The data needed to update a DiscordAlertLog.
     */
    data: XOR<DiscordAlertLogUpdateInput, DiscordAlertLogUncheckedUpdateInput>
    /**
     * Choose, which DiscordAlertLog to update.
     */
    where: DiscordAlertLogWhereUniqueInput
  }

  /**
   * DiscordAlertLog updateMany
   */
  export type DiscordAlertLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DiscordAlertLogs.
     */
    data: XOR<DiscordAlertLogUpdateManyMutationInput, DiscordAlertLogUncheckedUpdateManyInput>
    /**
     * Filter which DiscordAlertLogs to update
     */
    where?: DiscordAlertLogWhereInput
    /**
     * Limit how many DiscordAlertLogs to update.
     */
    limit?: number
  }

  /**
   * DiscordAlertLog updateManyAndReturn
   */
  export type DiscordAlertLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
    /**
     * The data used to update DiscordAlertLogs.
     */
    data: XOR<DiscordAlertLogUpdateManyMutationInput, DiscordAlertLogUncheckedUpdateManyInput>
    /**
     * Filter which DiscordAlertLogs to update
     */
    where?: DiscordAlertLogWhereInput
    /**
     * Limit how many DiscordAlertLogs to update.
     */
    limit?: number
  }

  /**
   * DiscordAlertLog upsert
   */
  export type DiscordAlertLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
    /**
     * The filter to search for the DiscordAlertLog to update in case it exists.
     */
    where: DiscordAlertLogWhereUniqueInput
    /**
     * In case the DiscordAlertLog found by the `where` argument doesn't exist, create a new DiscordAlertLog with this data.
     */
    create: XOR<DiscordAlertLogCreateInput, DiscordAlertLogUncheckedCreateInput>
    /**
     * In case the DiscordAlertLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DiscordAlertLogUpdateInput, DiscordAlertLogUncheckedUpdateInput>
  }

  /**
   * DiscordAlertLog delete
   */
  export type DiscordAlertLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
    /**
     * Filter which DiscordAlertLog to delete.
     */
    where: DiscordAlertLogWhereUniqueInput
  }

  /**
   * DiscordAlertLog deleteMany
   */
  export type DiscordAlertLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DiscordAlertLogs to delete
     */
    where?: DiscordAlertLogWhereInput
    /**
     * Limit how many DiscordAlertLogs to delete.
     */
    limit?: number
  }

  /**
   * DiscordAlertLog without action
   */
  export type DiscordAlertLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DiscordAlertLog
     */
    select?: DiscordAlertLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DiscordAlertLog
     */
    omit?: DiscordAlertLogOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ProductScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    price: 'price',
    internalProductCode: 'internalProductCode',
    naverProductId: 'naverProductId',
    sellerManagementCode: 'sellerManagementCode',
    emailOptionName: 'emailOptionName',
    mailTemplateId: 'mailTemplateId',
    status: 'status',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const CodeScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    codeValue: 'codeValue',
    sequenceNo: 'sequenceNo',
    status: 'status',
    reservedAt: 'reservedAt',
    sentAt: 'sentAt',
    createdAt: 'createdAt'
  };

  export type CodeScalarFieldEnum = (typeof CodeScalarFieldEnum)[keyof typeof CodeScalarFieldEnum]


  export const OrderScalarFieldEnum: {
    id: 'id',
    platform: 'platform',
    naverOrderId: 'naverOrderId',
    ownOrderId: 'ownOrderId',
    orderStatus: 'orderStatus',
    ordererName: 'ordererName',
    paidAt: 'paidAt',
    totalAmount: 'totalAmount',
    rawPayload: 'rawPayload',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrderScalarFieldEnum = (typeof OrderScalarFieldEnum)[keyof typeof OrderScalarFieldEnum]


  export const OrderItemScalarFieldEnum: {
    id: 'id',
    orderId: 'orderId',
    productId: 'productId',
    productOrderId: 'productOrderId',
    productName: 'productName',
    quantity: 'quantity',
    buyerEmail: 'buyerEmail',
    unitPrice: 'unitPrice',
    fulfillmentStatus: 'fulfillmentStatus',
    failureReasonCode: 'failureReasonCode',
    failureReasonDetail: 'failureReasonDetail',
    paidAt: 'paidAt',
    processedAt: 'processedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrderItemScalarFieldEnum = (typeof OrderItemScalarFieldEnum)[keyof typeof OrderItemScalarFieldEnum]


  export const CodeAssignmentScalarFieldEnum: {
    id: 'id',
    orderItemId: 'orderItemId',
    codeId: 'codeId',
    status: 'status',
    assignedAt: 'assignedAt',
    sentAt: 'sentAt'
  };

  export type CodeAssignmentScalarFieldEnum = (typeof CodeAssignmentScalarFieldEnum)[keyof typeof CodeAssignmentScalarFieldEnum]


  export const FulfillmentJobScalarFieldEnum: {
    id: 'id',
    orderItemId: 'orderItemId',
    jobType: 'jobType',
    status: 'status',
    retryCount: 'retryCount',
    errorMessage: 'errorMessage',
    context: 'context',
    processedAt: 'processedAt',
    createdAt: 'createdAt'
  };

  export type FulfillmentJobScalarFieldEnum = (typeof FulfillmentJobScalarFieldEnum)[keyof typeof FulfillmentJobScalarFieldEnum]


  export const EmailLogScalarFieldEnum: {
    id: 'id',
    orderItemId: 'orderItemId',
    recipientEmail: 'recipientEmail',
    provider: 'provider',
    providerMessageId: 'providerMessageId',
    templateName: 'templateName',
    status: 'status',
    errorMessage: 'errorMessage',
    sentAt: 'sentAt',
    createdAt: 'createdAt'
  };

  export type EmailLogScalarFieldEnum = (typeof EmailLogScalarFieldEnum)[keyof typeof EmailLogScalarFieldEnum]


  export const MailTemplateScalarFieldEnum: {
    id: 'id',
    name: 'name',
    subject: 'subject',
    bodyHtml: 'bodyHtml',
    bodyText: 'bodyText',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MailTemplateScalarFieldEnum = (typeof MailTemplateScalarFieldEnum)[keyof typeof MailTemplateScalarFieldEnum]


  export const InventoryAlertStateScalarFieldEnum: {
    id: 'id',
    productId: 'productId',
    lowStockAlertSent: 'lowStockAlertSent',
    outOfStockAlertSent: 'outOfStockAlertSent',
    lastKnownAvailableCount: 'lastKnownAvailableCount',
    updatedAt: 'updatedAt'
  };

  export type InventoryAlertStateScalarFieldEnum = (typeof InventoryAlertStateScalarFieldEnum)[keyof typeof InventoryAlertStateScalarFieldEnum]


  export const SystemSettingScalarFieldEnum: {
    id: 'id',
    key: 'key',
    value: 'value',
    isSecret: 'isSecret',
    updatedAt: 'updatedAt'
  };

  export type SystemSettingScalarFieldEnum = (typeof SystemSettingScalarFieldEnum)[keyof typeof SystemSettingScalarFieldEnum]


  export const DiscordAlertLogScalarFieldEnum: {
    id: 'id',
    alertType: 'alertType',
    dedupeKey: 'dedupeKey',
    payload: 'payload',
    sentAt: 'sentAt'
  };

  export type DiscordAlertLogScalarFieldEnum = (typeof DiscordAlertLogScalarFieldEnum)[keyof typeof DiscordAlertLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'ProductStatus'
   */
  export type EnumProductStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProductStatus'>
    


  /**
   * Reference to a field of type 'ProductStatus[]'
   */
  export type ListEnumProductStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProductStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'CodeStatus'
   */
  export type EnumCodeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CodeStatus'>
    


  /**
   * Reference to a field of type 'CodeStatus[]'
   */
  export type ListEnumCodeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CodeStatus[]'>
    


  /**
   * Reference to a field of type 'Platform'
   */
  export type EnumPlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Platform'>
    


  /**
   * Reference to a field of type 'Platform[]'
   */
  export type ListEnumPlatformFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Platform[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'OrderItemFulfillmentStatus'
   */
  export type EnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderItemFulfillmentStatus'>
    


  /**
   * Reference to a field of type 'OrderItemFulfillmentStatus[]'
   */
  export type ListEnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'OrderItemFulfillmentStatus[]'>
    


  /**
   * Reference to a field of type 'CodeAssignmentStatus'
   */
  export type EnumCodeAssignmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CodeAssignmentStatus'>
    


  /**
   * Reference to a field of type 'CodeAssignmentStatus[]'
   */
  export type ListEnumCodeAssignmentStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CodeAssignmentStatus[]'>
    


  /**
   * Reference to a field of type 'FulfillmentJobStatus'
   */
  export type EnumFulfillmentJobStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FulfillmentJobStatus'>
    


  /**
   * Reference to a field of type 'FulfillmentJobStatus[]'
   */
  export type ListEnumFulfillmentJobStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'FulfillmentJobStatus[]'>
    


  /**
   * Reference to a field of type 'EmailLogStatus'
   */
  export type EnumEmailLogStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EmailLogStatus'>
    


  /**
   * Reference to a field of type 'EmailLogStatus[]'
   */
  export type ListEnumEmailLogStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'EmailLogStatus[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: UuidFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    price?: IntFilter<"Product"> | number
    internalProductCode?: StringFilter<"Product"> | string
    naverProductId?: StringNullableFilter<"Product"> | string | null
    sellerManagementCode?: StringFilter<"Product"> | string
    emailOptionName?: StringFilter<"Product"> | string
    mailTemplateId?: UuidNullableFilter<"Product"> | string | null
    status?: EnumProductStatusFilter<"Product"> | $Enums.ProductStatus
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    codes?: CodeListRelationFilter
    orderItems?: OrderItemListRelationFilter
    inventoryAlertState?: XOR<InventoryAlertStateNullableScalarRelationFilter, InventoryAlertStateWhereInput> | null
    mailTemplate?: XOR<MailTemplateNullableScalarRelationFilter, MailTemplateWhereInput> | null
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    price?: SortOrder
    internalProductCode?: SortOrder
    naverProductId?: SortOrderInput | SortOrder
    sellerManagementCode?: SortOrder
    emailOptionName?: SortOrder
    mailTemplateId?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    codes?: CodeOrderByRelationAggregateInput
    orderItems?: OrderItemOrderByRelationAggregateInput
    inventoryAlertState?: InventoryAlertStateOrderByWithRelationInput
    mailTemplate?: MailTemplateOrderByWithRelationInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    internalProductCode?: string
    naverProductId?: string
    sellerManagementCode?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    name?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    price?: IntFilter<"Product"> | number
    emailOptionName?: StringFilter<"Product"> | string
    mailTemplateId?: UuidNullableFilter<"Product"> | string | null
    status?: EnumProductStatusFilter<"Product"> | $Enums.ProductStatus
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
    codes?: CodeListRelationFilter
    orderItems?: OrderItemListRelationFilter
    inventoryAlertState?: XOR<InventoryAlertStateNullableScalarRelationFilter, InventoryAlertStateWhereInput> | null
    mailTemplate?: XOR<MailTemplateNullableScalarRelationFilter, MailTemplateWhereInput> | null
  }, "id" | "internalProductCode" | "naverProductId" | "sellerManagementCode">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    price?: SortOrder
    internalProductCode?: SortOrder
    naverProductId?: SortOrderInput | SortOrder
    sellerManagementCode?: SortOrder
    emailOptionName?: SortOrder
    mailTemplateId?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProductCountOrderByAggregateInput
    _avg?: ProductAvgOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
    _sum?: ProductSumOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Product"> | string
    name?: StringWithAggregatesFilter<"Product"> | string
    description?: StringNullableWithAggregatesFilter<"Product"> | string | null
    price?: IntWithAggregatesFilter<"Product"> | number
    internalProductCode?: StringWithAggregatesFilter<"Product"> | string
    naverProductId?: StringNullableWithAggregatesFilter<"Product"> | string | null
    sellerManagementCode?: StringWithAggregatesFilter<"Product"> | string
    emailOptionName?: StringWithAggregatesFilter<"Product"> | string
    mailTemplateId?: UuidNullableWithAggregatesFilter<"Product"> | string | null
    status?: EnumProductStatusWithAggregatesFilter<"Product"> | $Enums.ProductStatus
    createdAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Product"> | Date | string
  }

  export type CodeWhereInput = {
    AND?: CodeWhereInput | CodeWhereInput[]
    OR?: CodeWhereInput[]
    NOT?: CodeWhereInput | CodeWhereInput[]
    id?: UuidFilter<"Code"> | string
    productId?: UuidFilter<"Code"> | string
    codeValue?: StringFilter<"Code"> | string
    sequenceNo?: IntFilter<"Code"> | number
    status?: EnumCodeStatusFilter<"Code"> | $Enums.CodeStatus
    reservedAt?: DateTimeNullableFilter<"Code"> | Date | string | null
    sentAt?: DateTimeNullableFilter<"Code"> | Date | string | null
    createdAt?: DateTimeFilter<"Code"> | Date | string
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
    assignments?: CodeAssignmentListRelationFilter
  }

  export type CodeOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    codeValue?: SortOrder
    sequenceNo?: SortOrder
    status?: SortOrder
    reservedAt?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    product?: ProductOrderByWithRelationInput
    assignments?: CodeAssignmentOrderByRelationAggregateInput
  }

  export type CodeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    productId_sequenceNo?: CodeProductIdSequenceNoCompoundUniqueInput
    AND?: CodeWhereInput | CodeWhereInput[]
    OR?: CodeWhereInput[]
    NOT?: CodeWhereInput | CodeWhereInput[]
    productId?: UuidFilter<"Code"> | string
    codeValue?: StringFilter<"Code"> | string
    sequenceNo?: IntFilter<"Code"> | number
    status?: EnumCodeStatusFilter<"Code"> | $Enums.CodeStatus
    reservedAt?: DateTimeNullableFilter<"Code"> | Date | string | null
    sentAt?: DateTimeNullableFilter<"Code"> | Date | string | null
    createdAt?: DateTimeFilter<"Code"> | Date | string
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
    assignments?: CodeAssignmentListRelationFilter
  }, "id" | "productId_sequenceNo">

  export type CodeOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    codeValue?: SortOrder
    sequenceNo?: SortOrder
    status?: SortOrder
    reservedAt?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: CodeCountOrderByAggregateInput
    _avg?: CodeAvgOrderByAggregateInput
    _max?: CodeMaxOrderByAggregateInput
    _min?: CodeMinOrderByAggregateInput
    _sum?: CodeSumOrderByAggregateInput
  }

  export type CodeScalarWhereWithAggregatesInput = {
    AND?: CodeScalarWhereWithAggregatesInput | CodeScalarWhereWithAggregatesInput[]
    OR?: CodeScalarWhereWithAggregatesInput[]
    NOT?: CodeScalarWhereWithAggregatesInput | CodeScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Code"> | string
    productId?: UuidWithAggregatesFilter<"Code"> | string
    codeValue?: StringWithAggregatesFilter<"Code"> | string
    sequenceNo?: IntWithAggregatesFilter<"Code"> | number
    status?: EnumCodeStatusWithAggregatesFilter<"Code"> | $Enums.CodeStatus
    reservedAt?: DateTimeNullableWithAggregatesFilter<"Code"> | Date | string | null
    sentAt?: DateTimeNullableWithAggregatesFilter<"Code"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Code"> | Date | string
  }

  export type OrderWhereInput = {
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    id?: UuidFilter<"Order"> | string
    platform?: EnumPlatformFilter<"Order"> | $Enums.Platform
    naverOrderId?: StringNullableFilter<"Order"> | string | null
    ownOrderId?: StringNullableFilter<"Order"> | string | null
    orderStatus?: StringFilter<"Order"> | string
    ordererName?: StringNullableFilter<"Order"> | string | null
    paidAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    totalAmount?: IntFilter<"Order"> | number
    rawPayload?: JsonNullableFilter<"Order">
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    orderItems?: OrderItemListRelationFilter
  }

  export type OrderOrderByWithRelationInput = {
    id?: SortOrder
    platform?: SortOrder
    naverOrderId?: SortOrderInput | SortOrder
    ownOrderId?: SortOrderInput | SortOrder
    orderStatus?: SortOrder
    ordererName?: SortOrderInput | SortOrder
    paidAt?: SortOrderInput | SortOrder
    totalAmount?: SortOrder
    rawPayload?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    orderItems?: OrderItemOrderByRelationAggregateInput
  }

  export type OrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    naverOrderId?: string
    ownOrderId?: string
    AND?: OrderWhereInput | OrderWhereInput[]
    OR?: OrderWhereInput[]
    NOT?: OrderWhereInput | OrderWhereInput[]
    platform?: EnumPlatformFilter<"Order"> | $Enums.Platform
    orderStatus?: StringFilter<"Order"> | string
    ordererName?: StringNullableFilter<"Order"> | string | null
    paidAt?: DateTimeNullableFilter<"Order"> | Date | string | null
    totalAmount?: IntFilter<"Order"> | number
    rawPayload?: JsonNullableFilter<"Order">
    createdAt?: DateTimeFilter<"Order"> | Date | string
    updatedAt?: DateTimeFilter<"Order"> | Date | string
    orderItems?: OrderItemListRelationFilter
  }, "id" | "naverOrderId" | "ownOrderId">

  export type OrderOrderByWithAggregationInput = {
    id?: SortOrder
    platform?: SortOrder
    naverOrderId?: SortOrderInput | SortOrder
    ownOrderId?: SortOrderInput | SortOrder
    orderStatus?: SortOrder
    ordererName?: SortOrderInput | SortOrder
    paidAt?: SortOrderInput | SortOrder
    totalAmount?: SortOrder
    rawPayload?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrderCountOrderByAggregateInput
    _avg?: OrderAvgOrderByAggregateInput
    _max?: OrderMaxOrderByAggregateInput
    _min?: OrderMinOrderByAggregateInput
    _sum?: OrderSumOrderByAggregateInput
  }

  export type OrderScalarWhereWithAggregatesInput = {
    AND?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    OR?: OrderScalarWhereWithAggregatesInput[]
    NOT?: OrderScalarWhereWithAggregatesInput | OrderScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Order"> | string
    platform?: EnumPlatformWithAggregatesFilter<"Order"> | $Enums.Platform
    naverOrderId?: StringNullableWithAggregatesFilter<"Order"> | string | null
    ownOrderId?: StringNullableWithAggregatesFilter<"Order"> | string | null
    orderStatus?: StringWithAggregatesFilter<"Order"> | string
    ordererName?: StringNullableWithAggregatesFilter<"Order"> | string | null
    paidAt?: DateTimeNullableWithAggregatesFilter<"Order"> | Date | string | null
    totalAmount?: IntWithAggregatesFilter<"Order"> | number
    rawPayload?: JsonNullableWithAggregatesFilter<"Order">
    createdAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Order"> | Date | string
  }

  export type OrderItemWhereInput = {
    AND?: OrderItemWhereInput | OrderItemWhereInput[]
    OR?: OrderItemWhereInput[]
    NOT?: OrderItemWhereInput | OrderItemWhereInput[]
    id?: UuidFilter<"OrderItem"> | string
    orderId?: UuidFilter<"OrderItem"> | string
    productId?: UuidNullableFilter<"OrderItem"> | string | null
    productOrderId?: StringFilter<"OrderItem"> | string
    productName?: StringFilter<"OrderItem"> | string
    quantity?: IntFilter<"OrderItem"> | number
    buyerEmail?: StringNullableFilter<"OrderItem"> | string | null
    unitPrice?: IntFilter<"OrderItem"> | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFilter<"OrderItem"> | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: StringNullableFilter<"OrderItem"> | string | null
    failureReasonDetail?: StringNullableFilter<"OrderItem"> | string | null
    paidAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
    processedAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
    createdAt?: DateTimeFilter<"OrderItem"> | Date | string
    updatedAt?: DateTimeFilter<"OrderItem"> | Date | string
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
    product?: XOR<ProductNullableScalarRelationFilter, ProductWhereInput> | null
    codeAssignment?: XOR<CodeAssignmentNullableScalarRelationFilter, CodeAssignmentWhereInput> | null
    fulfillmentJobs?: FulfillmentJobListRelationFilter
    emailLogs?: EmailLogListRelationFilter
  }

  export type OrderItemOrderByWithRelationInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrderInput | SortOrder
    productOrderId?: SortOrder
    productName?: SortOrder
    quantity?: SortOrder
    buyerEmail?: SortOrderInput | SortOrder
    unitPrice?: SortOrder
    fulfillmentStatus?: SortOrder
    failureReasonCode?: SortOrderInput | SortOrder
    failureReasonDetail?: SortOrderInput | SortOrder
    paidAt?: SortOrderInput | SortOrder
    processedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    order?: OrderOrderByWithRelationInput
    product?: ProductOrderByWithRelationInput
    codeAssignment?: CodeAssignmentOrderByWithRelationInput
    fulfillmentJobs?: FulfillmentJobOrderByRelationAggregateInput
    emailLogs?: EmailLogOrderByRelationAggregateInput
  }

  export type OrderItemWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    productOrderId?: string
    AND?: OrderItemWhereInput | OrderItemWhereInput[]
    OR?: OrderItemWhereInput[]
    NOT?: OrderItemWhereInput | OrderItemWhereInput[]
    orderId?: UuidFilter<"OrderItem"> | string
    productId?: UuidNullableFilter<"OrderItem"> | string | null
    productName?: StringFilter<"OrderItem"> | string
    quantity?: IntFilter<"OrderItem"> | number
    buyerEmail?: StringNullableFilter<"OrderItem"> | string | null
    unitPrice?: IntFilter<"OrderItem"> | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFilter<"OrderItem"> | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: StringNullableFilter<"OrderItem"> | string | null
    failureReasonDetail?: StringNullableFilter<"OrderItem"> | string | null
    paidAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
    processedAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
    createdAt?: DateTimeFilter<"OrderItem"> | Date | string
    updatedAt?: DateTimeFilter<"OrderItem"> | Date | string
    order?: XOR<OrderScalarRelationFilter, OrderWhereInput>
    product?: XOR<ProductNullableScalarRelationFilter, ProductWhereInput> | null
    codeAssignment?: XOR<CodeAssignmentNullableScalarRelationFilter, CodeAssignmentWhereInput> | null
    fulfillmentJobs?: FulfillmentJobListRelationFilter
    emailLogs?: EmailLogListRelationFilter
  }, "id" | "productOrderId">

  export type OrderItemOrderByWithAggregationInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrderInput | SortOrder
    productOrderId?: SortOrder
    productName?: SortOrder
    quantity?: SortOrder
    buyerEmail?: SortOrderInput | SortOrder
    unitPrice?: SortOrder
    fulfillmentStatus?: SortOrder
    failureReasonCode?: SortOrderInput | SortOrder
    failureReasonDetail?: SortOrderInput | SortOrder
    paidAt?: SortOrderInput | SortOrder
    processedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrderItemCountOrderByAggregateInput
    _avg?: OrderItemAvgOrderByAggregateInput
    _max?: OrderItemMaxOrderByAggregateInput
    _min?: OrderItemMinOrderByAggregateInput
    _sum?: OrderItemSumOrderByAggregateInput
  }

  export type OrderItemScalarWhereWithAggregatesInput = {
    AND?: OrderItemScalarWhereWithAggregatesInput | OrderItemScalarWhereWithAggregatesInput[]
    OR?: OrderItemScalarWhereWithAggregatesInput[]
    NOT?: OrderItemScalarWhereWithAggregatesInput | OrderItemScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"OrderItem"> | string
    orderId?: UuidWithAggregatesFilter<"OrderItem"> | string
    productId?: UuidNullableWithAggregatesFilter<"OrderItem"> | string | null
    productOrderId?: StringWithAggregatesFilter<"OrderItem"> | string
    productName?: StringWithAggregatesFilter<"OrderItem"> | string
    quantity?: IntWithAggregatesFilter<"OrderItem"> | number
    buyerEmail?: StringNullableWithAggregatesFilter<"OrderItem"> | string | null
    unitPrice?: IntWithAggregatesFilter<"OrderItem"> | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusWithAggregatesFilter<"OrderItem"> | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: StringNullableWithAggregatesFilter<"OrderItem"> | string | null
    failureReasonDetail?: StringNullableWithAggregatesFilter<"OrderItem"> | string | null
    paidAt?: DateTimeNullableWithAggregatesFilter<"OrderItem"> | Date | string | null
    processedAt?: DateTimeNullableWithAggregatesFilter<"OrderItem"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OrderItem"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OrderItem"> | Date | string
  }

  export type CodeAssignmentWhereInput = {
    AND?: CodeAssignmentWhereInput | CodeAssignmentWhereInput[]
    OR?: CodeAssignmentWhereInput[]
    NOT?: CodeAssignmentWhereInput | CodeAssignmentWhereInput[]
    id?: UuidFilter<"CodeAssignment"> | string
    orderItemId?: UuidFilter<"CodeAssignment"> | string
    codeId?: UuidFilter<"CodeAssignment"> | string
    status?: EnumCodeAssignmentStatusFilter<"CodeAssignment"> | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFilter<"CodeAssignment"> | Date | string
    sentAt?: DateTimeNullableFilter<"CodeAssignment"> | Date | string | null
    orderItem?: XOR<OrderItemScalarRelationFilter, OrderItemWhereInput>
    code?: XOR<CodeScalarRelationFilter, CodeWhereInput>
  }

  export type CodeAssignmentOrderByWithRelationInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    codeId?: SortOrder
    status?: SortOrder
    assignedAt?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    orderItem?: OrderItemOrderByWithRelationInput
    code?: CodeOrderByWithRelationInput
  }

  export type CodeAssignmentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    orderItemId?: string
    AND?: CodeAssignmentWhereInput | CodeAssignmentWhereInput[]
    OR?: CodeAssignmentWhereInput[]
    NOT?: CodeAssignmentWhereInput | CodeAssignmentWhereInput[]
    codeId?: UuidFilter<"CodeAssignment"> | string
    status?: EnumCodeAssignmentStatusFilter<"CodeAssignment"> | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFilter<"CodeAssignment"> | Date | string
    sentAt?: DateTimeNullableFilter<"CodeAssignment"> | Date | string | null
    orderItem?: XOR<OrderItemScalarRelationFilter, OrderItemWhereInput>
    code?: XOR<CodeScalarRelationFilter, CodeWhereInput>
  }, "id" | "orderItemId">

  export type CodeAssignmentOrderByWithAggregationInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    codeId?: SortOrder
    status?: SortOrder
    assignedAt?: SortOrder
    sentAt?: SortOrderInput | SortOrder
    _count?: CodeAssignmentCountOrderByAggregateInput
    _max?: CodeAssignmentMaxOrderByAggregateInput
    _min?: CodeAssignmentMinOrderByAggregateInput
  }

  export type CodeAssignmentScalarWhereWithAggregatesInput = {
    AND?: CodeAssignmentScalarWhereWithAggregatesInput | CodeAssignmentScalarWhereWithAggregatesInput[]
    OR?: CodeAssignmentScalarWhereWithAggregatesInput[]
    NOT?: CodeAssignmentScalarWhereWithAggregatesInput | CodeAssignmentScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"CodeAssignment"> | string
    orderItemId?: UuidWithAggregatesFilter<"CodeAssignment"> | string
    codeId?: UuidWithAggregatesFilter<"CodeAssignment"> | string
    status?: EnumCodeAssignmentStatusWithAggregatesFilter<"CodeAssignment"> | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeWithAggregatesFilter<"CodeAssignment"> | Date | string
    sentAt?: DateTimeNullableWithAggregatesFilter<"CodeAssignment"> | Date | string | null
  }

  export type FulfillmentJobWhereInput = {
    AND?: FulfillmentJobWhereInput | FulfillmentJobWhereInput[]
    OR?: FulfillmentJobWhereInput[]
    NOT?: FulfillmentJobWhereInput | FulfillmentJobWhereInput[]
    id?: UuidFilter<"FulfillmentJob"> | string
    orderItemId?: UuidFilter<"FulfillmentJob"> | string
    jobType?: StringFilter<"FulfillmentJob"> | string
    status?: EnumFulfillmentJobStatusFilter<"FulfillmentJob"> | $Enums.FulfillmentJobStatus
    retryCount?: IntFilter<"FulfillmentJob"> | number
    errorMessage?: StringNullableFilter<"FulfillmentJob"> | string | null
    context?: JsonNullableFilter<"FulfillmentJob">
    processedAt?: DateTimeNullableFilter<"FulfillmentJob"> | Date | string | null
    createdAt?: DateTimeFilter<"FulfillmentJob"> | Date | string
    orderItem?: XOR<OrderItemScalarRelationFilter, OrderItemWhereInput>
  }

  export type FulfillmentJobOrderByWithRelationInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    jobType?: SortOrder
    status?: SortOrder
    retryCount?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    context?: SortOrderInput | SortOrder
    processedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    orderItem?: OrderItemOrderByWithRelationInput
  }

  export type FulfillmentJobWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: FulfillmentJobWhereInput | FulfillmentJobWhereInput[]
    OR?: FulfillmentJobWhereInput[]
    NOT?: FulfillmentJobWhereInput | FulfillmentJobWhereInput[]
    orderItemId?: UuidFilter<"FulfillmentJob"> | string
    jobType?: StringFilter<"FulfillmentJob"> | string
    status?: EnumFulfillmentJobStatusFilter<"FulfillmentJob"> | $Enums.FulfillmentJobStatus
    retryCount?: IntFilter<"FulfillmentJob"> | number
    errorMessage?: StringNullableFilter<"FulfillmentJob"> | string | null
    context?: JsonNullableFilter<"FulfillmentJob">
    processedAt?: DateTimeNullableFilter<"FulfillmentJob"> | Date | string | null
    createdAt?: DateTimeFilter<"FulfillmentJob"> | Date | string
    orderItem?: XOR<OrderItemScalarRelationFilter, OrderItemWhereInput>
  }, "id">

  export type FulfillmentJobOrderByWithAggregationInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    jobType?: SortOrder
    status?: SortOrder
    retryCount?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    context?: SortOrderInput | SortOrder
    processedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: FulfillmentJobCountOrderByAggregateInput
    _avg?: FulfillmentJobAvgOrderByAggregateInput
    _max?: FulfillmentJobMaxOrderByAggregateInput
    _min?: FulfillmentJobMinOrderByAggregateInput
    _sum?: FulfillmentJobSumOrderByAggregateInput
  }

  export type FulfillmentJobScalarWhereWithAggregatesInput = {
    AND?: FulfillmentJobScalarWhereWithAggregatesInput | FulfillmentJobScalarWhereWithAggregatesInput[]
    OR?: FulfillmentJobScalarWhereWithAggregatesInput[]
    NOT?: FulfillmentJobScalarWhereWithAggregatesInput | FulfillmentJobScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"FulfillmentJob"> | string
    orderItemId?: UuidWithAggregatesFilter<"FulfillmentJob"> | string
    jobType?: StringWithAggregatesFilter<"FulfillmentJob"> | string
    status?: EnumFulfillmentJobStatusWithAggregatesFilter<"FulfillmentJob"> | $Enums.FulfillmentJobStatus
    retryCount?: IntWithAggregatesFilter<"FulfillmentJob"> | number
    errorMessage?: StringNullableWithAggregatesFilter<"FulfillmentJob"> | string | null
    context?: JsonNullableWithAggregatesFilter<"FulfillmentJob">
    processedAt?: DateTimeNullableWithAggregatesFilter<"FulfillmentJob"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"FulfillmentJob"> | Date | string
  }

  export type EmailLogWhereInput = {
    AND?: EmailLogWhereInput | EmailLogWhereInput[]
    OR?: EmailLogWhereInput[]
    NOT?: EmailLogWhereInput | EmailLogWhereInput[]
    id?: UuidFilter<"EmailLog"> | string
    orderItemId?: UuidFilter<"EmailLog"> | string
    recipientEmail?: StringFilter<"EmailLog"> | string
    provider?: StringFilter<"EmailLog"> | string
    providerMessageId?: StringNullableFilter<"EmailLog"> | string | null
    templateName?: StringFilter<"EmailLog"> | string
    status?: EnumEmailLogStatusFilter<"EmailLog"> | $Enums.EmailLogStatus
    errorMessage?: StringNullableFilter<"EmailLog"> | string | null
    sentAt?: DateTimeNullableFilter<"EmailLog"> | Date | string | null
    createdAt?: DateTimeFilter<"EmailLog"> | Date | string
    orderItem?: XOR<OrderItemScalarRelationFilter, OrderItemWhereInput>
  }

  export type EmailLogOrderByWithRelationInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    recipientEmail?: SortOrder
    provider?: SortOrder
    providerMessageId?: SortOrderInput | SortOrder
    templateName?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    orderItem?: OrderItemOrderByWithRelationInput
  }

  export type EmailLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EmailLogWhereInput | EmailLogWhereInput[]
    OR?: EmailLogWhereInput[]
    NOT?: EmailLogWhereInput | EmailLogWhereInput[]
    orderItemId?: UuidFilter<"EmailLog"> | string
    recipientEmail?: StringFilter<"EmailLog"> | string
    provider?: StringFilter<"EmailLog"> | string
    providerMessageId?: StringNullableFilter<"EmailLog"> | string | null
    templateName?: StringFilter<"EmailLog"> | string
    status?: EnumEmailLogStatusFilter<"EmailLog"> | $Enums.EmailLogStatus
    errorMessage?: StringNullableFilter<"EmailLog"> | string | null
    sentAt?: DateTimeNullableFilter<"EmailLog"> | Date | string | null
    createdAt?: DateTimeFilter<"EmailLog"> | Date | string
    orderItem?: XOR<OrderItemScalarRelationFilter, OrderItemWhereInput>
  }, "id">

  export type EmailLogOrderByWithAggregationInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    recipientEmail?: SortOrder
    provider?: SortOrder
    providerMessageId?: SortOrderInput | SortOrder
    templateName?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: EmailLogCountOrderByAggregateInput
    _max?: EmailLogMaxOrderByAggregateInput
    _min?: EmailLogMinOrderByAggregateInput
  }

  export type EmailLogScalarWhereWithAggregatesInput = {
    AND?: EmailLogScalarWhereWithAggregatesInput | EmailLogScalarWhereWithAggregatesInput[]
    OR?: EmailLogScalarWhereWithAggregatesInput[]
    NOT?: EmailLogScalarWhereWithAggregatesInput | EmailLogScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"EmailLog"> | string
    orderItemId?: UuidWithAggregatesFilter<"EmailLog"> | string
    recipientEmail?: StringWithAggregatesFilter<"EmailLog"> | string
    provider?: StringWithAggregatesFilter<"EmailLog"> | string
    providerMessageId?: StringNullableWithAggregatesFilter<"EmailLog"> | string | null
    templateName?: StringWithAggregatesFilter<"EmailLog"> | string
    status?: EnumEmailLogStatusWithAggregatesFilter<"EmailLog"> | $Enums.EmailLogStatus
    errorMessage?: StringNullableWithAggregatesFilter<"EmailLog"> | string | null
    sentAt?: DateTimeNullableWithAggregatesFilter<"EmailLog"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"EmailLog"> | Date | string
  }

  export type MailTemplateWhereInput = {
    AND?: MailTemplateWhereInput | MailTemplateWhereInput[]
    OR?: MailTemplateWhereInput[]
    NOT?: MailTemplateWhereInput | MailTemplateWhereInput[]
    id?: UuidFilter<"MailTemplate"> | string
    name?: StringFilter<"MailTemplate"> | string
    subject?: StringFilter<"MailTemplate"> | string
    bodyHtml?: StringFilter<"MailTemplate"> | string
    bodyText?: StringFilter<"MailTemplate"> | string
    isActive?: BoolFilter<"MailTemplate"> | boolean
    createdAt?: DateTimeFilter<"MailTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"MailTemplate"> | Date | string
    products?: ProductListRelationFilter
  }

  export type MailTemplateOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    subject?: SortOrder
    bodyHtml?: SortOrder
    bodyText?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    products?: ProductOrderByRelationAggregateInput
  }

  export type MailTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MailTemplateWhereInput | MailTemplateWhereInput[]
    OR?: MailTemplateWhereInput[]
    NOT?: MailTemplateWhereInput | MailTemplateWhereInput[]
    name?: StringFilter<"MailTemplate"> | string
    subject?: StringFilter<"MailTemplate"> | string
    bodyHtml?: StringFilter<"MailTemplate"> | string
    bodyText?: StringFilter<"MailTemplate"> | string
    isActive?: BoolFilter<"MailTemplate"> | boolean
    createdAt?: DateTimeFilter<"MailTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"MailTemplate"> | Date | string
    products?: ProductListRelationFilter
  }, "id">

  export type MailTemplateOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    subject?: SortOrder
    bodyHtml?: SortOrder
    bodyText?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MailTemplateCountOrderByAggregateInput
    _max?: MailTemplateMaxOrderByAggregateInput
    _min?: MailTemplateMinOrderByAggregateInput
  }

  export type MailTemplateScalarWhereWithAggregatesInput = {
    AND?: MailTemplateScalarWhereWithAggregatesInput | MailTemplateScalarWhereWithAggregatesInput[]
    OR?: MailTemplateScalarWhereWithAggregatesInput[]
    NOT?: MailTemplateScalarWhereWithAggregatesInput | MailTemplateScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"MailTemplate"> | string
    name?: StringWithAggregatesFilter<"MailTemplate"> | string
    subject?: StringWithAggregatesFilter<"MailTemplate"> | string
    bodyHtml?: StringWithAggregatesFilter<"MailTemplate"> | string
    bodyText?: StringWithAggregatesFilter<"MailTemplate"> | string
    isActive?: BoolWithAggregatesFilter<"MailTemplate"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"MailTemplate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MailTemplate"> | Date | string
  }

  export type InventoryAlertStateWhereInput = {
    AND?: InventoryAlertStateWhereInput | InventoryAlertStateWhereInput[]
    OR?: InventoryAlertStateWhereInput[]
    NOT?: InventoryAlertStateWhereInput | InventoryAlertStateWhereInput[]
    id?: UuidFilter<"InventoryAlertState"> | string
    productId?: UuidFilter<"InventoryAlertState"> | string
    lowStockAlertSent?: BoolFilter<"InventoryAlertState"> | boolean
    outOfStockAlertSent?: BoolFilter<"InventoryAlertState"> | boolean
    lastKnownAvailableCount?: IntFilter<"InventoryAlertState"> | number
    updatedAt?: DateTimeFilter<"InventoryAlertState"> | Date | string
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }

  export type InventoryAlertStateOrderByWithRelationInput = {
    id?: SortOrder
    productId?: SortOrder
    lowStockAlertSent?: SortOrder
    outOfStockAlertSent?: SortOrder
    lastKnownAvailableCount?: SortOrder
    updatedAt?: SortOrder
    product?: ProductOrderByWithRelationInput
  }

  export type InventoryAlertStateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    productId?: string
    AND?: InventoryAlertStateWhereInput | InventoryAlertStateWhereInput[]
    OR?: InventoryAlertStateWhereInput[]
    NOT?: InventoryAlertStateWhereInput | InventoryAlertStateWhereInput[]
    lowStockAlertSent?: BoolFilter<"InventoryAlertState"> | boolean
    outOfStockAlertSent?: BoolFilter<"InventoryAlertState"> | boolean
    lastKnownAvailableCount?: IntFilter<"InventoryAlertState"> | number
    updatedAt?: DateTimeFilter<"InventoryAlertState"> | Date | string
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }, "id" | "productId">

  export type InventoryAlertStateOrderByWithAggregationInput = {
    id?: SortOrder
    productId?: SortOrder
    lowStockAlertSent?: SortOrder
    outOfStockAlertSent?: SortOrder
    lastKnownAvailableCount?: SortOrder
    updatedAt?: SortOrder
    _count?: InventoryAlertStateCountOrderByAggregateInput
    _avg?: InventoryAlertStateAvgOrderByAggregateInput
    _max?: InventoryAlertStateMaxOrderByAggregateInput
    _min?: InventoryAlertStateMinOrderByAggregateInput
    _sum?: InventoryAlertStateSumOrderByAggregateInput
  }

  export type InventoryAlertStateScalarWhereWithAggregatesInput = {
    AND?: InventoryAlertStateScalarWhereWithAggregatesInput | InventoryAlertStateScalarWhereWithAggregatesInput[]
    OR?: InventoryAlertStateScalarWhereWithAggregatesInput[]
    NOT?: InventoryAlertStateScalarWhereWithAggregatesInput | InventoryAlertStateScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"InventoryAlertState"> | string
    productId?: UuidWithAggregatesFilter<"InventoryAlertState"> | string
    lowStockAlertSent?: BoolWithAggregatesFilter<"InventoryAlertState"> | boolean
    outOfStockAlertSent?: BoolWithAggregatesFilter<"InventoryAlertState"> | boolean
    lastKnownAvailableCount?: IntWithAggregatesFilter<"InventoryAlertState"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"InventoryAlertState"> | Date | string
  }

  export type SystemSettingWhereInput = {
    AND?: SystemSettingWhereInput | SystemSettingWhereInput[]
    OR?: SystemSettingWhereInput[]
    NOT?: SystemSettingWhereInput | SystemSettingWhereInput[]
    id?: UuidFilter<"SystemSetting"> | string
    key?: StringFilter<"SystemSetting"> | string
    value?: StringFilter<"SystemSetting"> | string
    isSecret?: BoolFilter<"SystemSetting"> | boolean
    updatedAt?: DateTimeFilter<"SystemSetting"> | Date | string
  }

  export type SystemSettingOrderByWithRelationInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    isSecret?: SortOrder
    updatedAt?: SortOrder
  }

  export type SystemSettingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    key?: string
    AND?: SystemSettingWhereInput | SystemSettingWhereInput[]
    OR?: SystemSettingWhereInput[]
    NOT?: SystemSettingWhereInput | SystemSettingWhereInput[]
    value?: StringFilter<"SystemSetting"> | string
    isSecret?: BoolFilter<"SystemSetting"> | boolean
    updatedAt?: DateTimeFilter<"SystemSetting"> | Date | string
  }, "id" | "key">

  export type SystemSettingOrderByWithAggregationInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    isSecret?: SortOrder
    updatedAt?: SortOrder
    _count?: SystemSettingCountOrderByAggregateInput
    _max?: SystemSettingMaxOrderByAggregateInput
    _min?: SystemSettingMinOrderByAggregateInput
  }

  export type SystemSettingScalarWhereWithAggregatesInput = {
    AND?: SystemSettingScalarWhereWithAggregatesInput | SystemSettingScalarWhereWithAggregatesInput[]
    OR?: SystemSettingScalarWhereWithAggregatesInput[]
    NOT?: SystemSettingScalarWhereWithAggregatesInput | SystemSettingScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"SystemSetting"> | string
    key?: StringWithAggregatesFilter<"SystemSetting"> | string
    value?: StringWithAggregatesFilter<"SystemSetting"> | string
    isSecret?: BoolWithAggregatesFilter<"SystemSetting"> | boolean
    updatedAt?: DateTimeWithAggregatesFilter<"SystemSetting"> | Date | string
  }

  export type DiscordAlertLogWhereInput = {
    AND?: DiscordAlertLogWhereInput | DiscordAlertLogWhereInput[]
    OR?: DiscordAlertLogWhereInput[]
    NOT?: DiscordAlertLogWhereInput | DiscordAlertLogWhereInput[]
    id?: UuidFilter<"DiscordAlertLog"> | string
    alertType?: StringFilter<"DiscordAlertLog"> | string
    dedupeKey?: StringFilter<"DiscordAlertLog"> | string
    payload?: JsonFilter<"DiscordAlertLog">
    sentAt?: DateTimeFilter<"DiscordAlertLog"> | Date | string
  }

  export type DiscordAlertLogOrderByWithRelationInput = {
    id?: SortOrder
    alertType?: SortOrder
    dedupeKey?: SortOrder
    payload?: SortOrder
    sentAt?: SortOrder
  }

  export type DiscordAlertLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    dedupeKey?: string
    AND?: DiscordAlertLogWhereInput | DiscordAlertLogWhereInput[]
    OR?: DiscordAlertLogWhereInput[]
    NOT?: DiscordAlertLogWhereInput | DiscordAlertLogWhereInput[]
    alertType?: StringFilter<"DiscordAlertLog"> | string
    payload?: JsonFilter<"DiscordAlertLog">
    sentAt?: DateTimeFilter<"DiscordAlertLog"> | Date | string
  }, "id" | "dedupeKey">

  export type DiscordAlertLogOrderByWithAggregationInput = {
    id?: SortOrder
    alertType?: SortOrder
    dedupeKey?: SortOrder
    payload?: SortOrder
    sentAt?: SortOrder
    _count?: DiscordAlertLogCountOrderByAggregateInput
    _max?: DiscordAlertLogMaxOrderByAggregateInput
    _min?: DiscordAlertLogMinOrderByAggregateInput
  }

  export type DiscordAlertLogScalarWhereWithAggregatesInput = {
    AND?: DiscordAlertLogScalarWhereWithAggregatesInput | DiscordAlertLogScalarWhereWithAggregatesInput[]
    OR?: DiscordAlertLogScalarWhereWithAggregatesInput[]
    NOT?: DiscordAlertLogScalarWhereWithAggregatesInput | DiscordAlertLogScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"DiscordAlertLog"> | string
    alertType?: StringWithAggregatesFilter<"DiscordAlertLog"> | string
    dedupeKey?: StringWithAggregatesFilter<"DiscordAlertLog"> | string
    payload?: JsonWithAggregatesFilter<"DiscordAlertLog">
    sentAt?: DateTimeWithAggregatesFilter<"DiscordAlertLog"> | Date | string
  }

  export type ProductCreateInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    codes?: CodeCreateNestedManyWithoutProductInput
    orderItems?: OrderItemCreateNestedManyWithoutProductInput
    inventoryAlertState?: InventoryAlertStateCreateNestedOneWithoutProductInput
    mailTemplate?: MailTemplateCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    mailTemplateId?: string | null
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    codes?: CodeUncheckedCreateNestedManyWithoutProductInput
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutProductInput
    inventoryAlertState?: InventoryAlertStateUncheckedCreateNestedOneWithoutProductInput
  }

  export type ProductUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codes?: CodeUpdateManyWithoutProductNestedInput
    orderItems?: OrderItemUpdateManyWithoutProductNestedInput
    inventoryAlertState?: InventoryAlertStateUpdateOneWithoutProductNestedInput
    mailTemplate?: MailTemplateUpdateOneWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    mailTemplateId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codes?: CodeUncheckedUpdateManyWithoutProductNestedInput
    orderItems?: OrderItemUncheckedUpdateManyWithoutProductNestedInput
    inventoryAlertState?: InventoryAlertStateUncheckedUpdateOneWithoutProductNestedInput
  }

  export type ProductCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    mailTemplateId?: string | null
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    mailTemplateId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodeCreateInput = {
    id?: string
    codeValue: string
    sequenceNo: number
    status?: $Enums.CodeStatus
    reservedAt?: Date | string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    product: ProductCreateNestedOneWithoutCodesInput
    assignments?: CodeAssignmentCreateNestedManyWithoutCodeInput
  }

  export type CodeUncheckedCreateInput = {
    id?: string
    productId: string
    codeValue: string
    sequenceNo: number
    status?: $Enums.CodeStatus
    reservedAt?: Date | string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    assignments?: CodeAssignmentUncheckedCreateNestedManyWithoutCodeInput
  }

  export type CodeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    codeValue?: StringFieldUpdateOperationsInput | string
    sequenceNo?: IntFieldUpdateOperationsInput | number
    status?: EnumCodeStatusFieldUpdateOperationsInput | $Enums.CodeStatus
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: ProductUpdateOneRequiredWithoutCodesNestedInput
    assignments?: CodeAssignmentUpdateManyWithoutCodeNestedInput
  }

  export type CodeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    codeValue?: StringFieldUpdateOperationsInput | string
    sequenceNo?: IntFieldUpdateOperationsInput | number
    status?: EnumCodeStatusFieldUpdateOperationsInput | $Enums.CodeStatus
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignments?: CodeAssignmentUncheckedUpdateManyWithoutCodeNestedInput
  }

  export type CodeCreateManyInput = {
    id?: string
    productId: string
    codeValue: string
    sequenceNo: number
    status?: $Enums.CodeStatus
    reservedAt?: Date | string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type CodeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    codeValue?: StringFieldUpdateOperationsInput | string
    sequenceNo?: IntFieldUpdateOperationsInput | number
    status?: EnumCodeStatusFieldUpdateOperationsInput | $Enums.CodeStatus
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    codeValue?: StringFieldUpdateOperationsInput | string
    sequenceNo?: IntFieldUpdateOperationsInput | number
    status?: EnumCodeStatusFieldUpdateOperationsInput | $Enums.CodeStatus
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderCreateInput = {
    id?: string
    platform?: $Enums.Platform
    naverOrderId?: string | null
    ownOrderId?: string | null
    orderStatus: string
    ordererName?: string | null
    paidAt?: Date | string | null
    totalAmount?: number
    rawPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemCreateNestedManyWithoutOrderInput
  }

  export type OrderUncheckedCreateInput = {
    id?: string
    platform?: $Enums.Platform
    naverOrderId?: string | null
    ownOrderId?: string | null
    orderStatus: string
    ordererName?: string | null
    paidAt?: Date | string | null
    totalAmount?: number
    rawPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutOrderInput
  }

  export type OrderUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    naverOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    ownOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    orderStatus?: StringFieldUpdateOperationsInput | string
    ordererName?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalAmount?: IntFieldUpdateOperationsInput | number
    rawPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUpdateManyWithoutOrderNestedInput
  }

  export type OrderUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    naverOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    ownOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    orderStatus?: StringFieldUpdateOperationsInput | string
    ordererName?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalAmount?: IntFieldUpdateOperationsInput | number
    rawPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUncheckedUpdateManyWithoutOrderNestedInput
  }

  export type OrderCreateManyInput = {
    id?: string
    platform?: $Enums.Platform
    naverOrderId?: string | null
    ownOrderId?: string | null
    orderStatus: string
    ordererName?: string | null
    paidAt?: Date | string | null
    totalAmount?: number
    rawPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    naverOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    ownOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    orderStatus?: StringFieldUpdateOperationsInput | string
    ordererName?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalAmount?: IntFieldUpdateOperationsInput | number
    rawPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    naverOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    ownOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    orderStatus?: StringFieldUpdateOperationsInput | string
    ordererName?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalAmount?: IntFieldUpdateOperationsInput | number
    rawPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderItemCreateInput = {
    id?: string
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutOrderItemsInput
    product?: ProductCreateNestedOneWithoutOrderItemsInput
    codeAssignment?: CodeAssignmentCreateNestedOneWithoutOrderItemInput
    fulfillmentJobs?: FulfillmentJobCreateNestedManyWithoutOrderItemInput
    emailLogs?: EmailLogCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemUncheckedCreateInput = {
    id?: string
    orderId: string
    productId?: string | null
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    codeAssignment?: CodeAssignmentUncheckedCreateNestedOneWithoutOrderItemInput
    fulfillmentJobs?: FulfillmentJobUncheckedCreateNestedManyWithoutOrderItemInput
    emailLogs?: EmailLogUncheckedCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutOrderItemsNestedInput
    product?: ProductUpdateOneWithoutOrderItemsNestedInput
    codeAssignment?: CodeAssignmentUpdateOneWithoutOrderItemNestedInput
    fulfillmentJobs?: FulfillmentJobUpdateManyWithoutOrderItemNestedInput
    emailLogs?: EmailLogUpdateManyWithoutOrderItemNestedInput
  }

  export type OrderItemUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codeAssignment?: CodeAssignmentUncheckedUpdateOneWithoutOrderItemNestedInput
    fulfillmentJobs?: FulfillmentJobUncheckedUpdateManyWithoutOrderItemNestedInput
    emailLogs?: EmailLogUncheckedUpdateManyWithoutOrderItemNestedInput
  }

  export type OrderItemCreateManyInput = {
    id?: string
    orderId: string
    productId?: string | null
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderItemUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderItemUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodeAssignmentCreateInput = {
    id?: string
    status?: $Enums.CodeAssignmentStatus
    assignedAt?: Date | string
    sentAt?: Date | string | null
    orderItem: OrderItemCreateNestedOneWithoutCodeAssignmentInput
    code: CodeCreateNestedOneWithoutAssignmentsInput
  }

  export type CodeAssignmentUncheckedCreateInput = {
    id?: string
    orderItemId: string
    codeId: string
    status?: $Enums.CodeAssignmentStatus
    assignedAt?: Date | string
    sentAt?: Date | string | null
  }

  export type CodeAssignmentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCodeAssignmentStatusFieldUpdateOperationsInput | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    orderItem?: OrderItemUpdateOneRequiredWithoutCodeAssignmentNestedInput
    code?: CodeUpdateOneRequiredWithoutAssignmentsNestedInput
  }

  export type CodeAssignmentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    codeId?: StringFieldUpdateOperationsInput | string
    status?: EnumCodeAssignmentStatusFieldUpdateOperationsInput | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CodeAssignmentCreateManyInput = {
    id?: string
    orderItemId: string
    codeId: string
    status?: $Enums.CodeAssignmentStatus
    assignedAt?: Date | string
    sentAt?: Date | string | null
  }

  export type CodeAssignmentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCodeAssignmentStatusFieldUpdateOperationsInput | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CodeAssignmentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    codeId?: StringFieldUpdateOperationsInput | string
    status?: EnumCodeAssignmentStatusFieldUpdateOperationsInput | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type FulfillmentJobCreateInput = {
    id?: string
    jobType: string
    status?: $Enums.FulfillmentJobStatus
    retryCount?: number
    errorMessage?: string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    createdAt?: Date | string
    orderItem: OrderItemCreateNestedOneWithoutFulfillmentJobsInput
  }

  export type FulfillmentJobUncheckedCreateInput = {
    id?: string
    orderItemId: string
    jobType: string
    status?: $Enums.FulfillmentJobStatus
    retryCount?: number
    errorMessage?: string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type FulfillmentJobUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    status?: EnumFulfillmentJobStatusFieldUpdateOperationsInput | $Enums.FulfillmentJobStatus
    retryCount?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItem?: OrderItemUpdateOneRequiredWithoutFulfillmentJobsNestedInput
  }

  export type FulfillmentJobUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    status?: EnumFulfillmentJobStatusFieldUpdateOperationsInput | $Enums.FulfillmentJobStatus
    retryCount?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FulfillmentJobCreateManyInput = {
    id?: string
    orderItemId: string
    jobType: string
    status?: $Enums.FulfillmentJobStatus
    retryCount?: number
    errorMessage?: string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type FulfillmentJobUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    status?: EnumFulfillmentJobStatusFieldUpdateOperationsInput | $Enums.FulfillmentJobStatus
    retryCount?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FulfillmentJobUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    status?: EnumFulfillmentJobStatusFieldUpdateOperationsInput | $Enums.FulfillmentJobStatus
    retryCount?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailLogCreateInput = {
    id?: string
    recipientEmail: string
    provider: string
    providerMessageId?: string | null
    templateName: string
    status?: $Enums.EmailLogStatus
    errorMessage?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    orderItem: OrderItemCreateNestedOneWithoutEmailLogsInput
  }

  export type EmailLogUncheckedCreateInput = {
    id?: string
    orderItemId: string
    recipientEmail: string
    provider: string
    providerMessageId?: string | null
    templateName: string
    status?: $Enums.EmailLogStatus
    errorMessage?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type EmailLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    recipientEmail?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    templateName?: StringFieldUpdateOperationsInput | string
    status?: EnumEmailLogStatusFieldUpdateOperationsInput | $Enums.EmailLogStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItem?: OrderItemUpdateOneRequiredWithoutEmailLogsNestedInput
  }

  export type EmailLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    recipientEmail?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    templateName?: StringFieldUpdateOperationsInput | string
    status?: EnumEmailLogStatusFieldUpdateOperationsInput | $Enums.EmailLogStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailLogCreateManyInput = {
    id?: string
    orderItemId: string
    recipientEmail: string
    provider: string
    providerMessageId?: string | null
    templateName: string
    status?: $Enums.EmailLogStatus
    errorMessage?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type EmailLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    recipientEmail?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    templateName?: StringFieldUpdateOperationsInput | string
    status?: EnumEmailLogStatusFieldUpdateOperationsInput | $Enums.EmailLogStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    recipientEmail?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    templateName?: StringFieldUpdateOperationsInput | string
    status?: EnumEmailLogStatusFieldUpdateOperationsInput | $Enums.EmailLogStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MailTemplateCreateInput = {
    id?: string
    name: string
    subject: string
    bodyHtml: string
    bodyText: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductCreateNestedManyWithoutMailTemplateInput
  }

  export type MailTemplateUncheckedCreateInput = {
    id?: string
    name: string
    subject: string
    bodyHtml: string
    bodyText: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    products?: ProductUncheckedCreateNestedManyWithoutMailTemplateInput
  }

  export type MailTemplateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyHtml?: StringFieldUpdateOperationsInput | string
    bodyText?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUpdateManyWithoutMailTemplateNestedInput
  }

  export type MailTemplateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyHtml?: StringFieldUpdateOperationsInput | string
    bodyText?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    products?: ProductUncheckedUpdateManyWithoutMailTemplateNestedInput
  }

  export type MailTemplateCreateManyInput = {
    id?: string
    name: string
    subject: string
    bodyHtml: string
    bodyText: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MailTemplateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyHtml?: StringFieldUpdateOperationsInput | string
    bodyText?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MailTemplateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyHtml?: StringFieldUpdateOperationsInput | string
    bodyText?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryAlertStateCreateInput = {
    id?: string
    lowStockAlertSent?: boolean
    outOfStockAlertSent?: boolean
    lastKnownAvailableCount?: number
    updatedAt?: Date | string
    product: ProductCreateNestedOneWithoutInventoryAlertStateInput
  }

  export type InventoryAlertStateUncheckedCreateInput = {
    id?: string
    productId: string
    lowStockAlertSent?: boolean
    outOfStockAlertSent?: boolean
    lastKnownAvailableCount?: number
    updatedAt?: Date | string
  }

  export type InventoryAlertStateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    lowStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    outOfStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    lastKnownAvailableCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: ProductUpdateOneRequiredWithoutInventoryAlertStateNestedInput
  }

  export type InventoryAlertStateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    lowStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    outOfStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    lastKnownAvailableCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryAlertStateCreateManyInput = {
    id?: string
    productId: string
    lowStockAlertSent?: boolean
    outOfStockAlertSent?: boolean
    lastKnownAvailableCount?: number
    updatedAt?: Date | string
  }

  export type InventoryAlertStateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    lowStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    outOfStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    lastKnownAvailableCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryAlertStateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    lowStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    outOfStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    lastKnownAvailableCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemSettingCreateInput = {
    id?: string
    key: string
    value: string
    isSecret?: boolean
    updatedAt?: Date | string
  }

  export type SystemSettingUncheckedCreateInput = {
    id?: string
    key: string
    value: string
    isSecret?: boolean
    updatedAt?: Date | string
  }

  export type SystemSettingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    isSecret?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemSettingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    isSecret?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemSettingCreateManyInput = {
    id?: string
    key: string
    value: string
    isSecret?: boolean
    updatedAt?: Date | string
  }

  export type SystemSettingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    isSecret?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SystemSettingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    key?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
    isSecret?: BoolFieldUpdateOperationsInput | boolean
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiscordAlertLogCreateInput = {
    id?: string
    alertType: string
    dedupeKey: string
    payload: JsonNullValueInput | InputJsonValue
    sentAt?: Date | string
  }

  export type DiscordAlertLogUncheckedCreateInput = {
    id?: string
    alertType: string
    dedupeKey: string
    payload: JsonNullValueInput | InputJsonValue
    sentAt?: Date | string
  }

  export type DiscordAlertLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    alertType?: StringFieldUpdateOperationsInput | string
    dedupeKey?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    sentAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiscordAlertLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    alertType?: StringFieldUpdateOperationsInput | string
    dedupeKey?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    sentAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiscordAlertLogCreateManyInput = {
    id?: string
    alertType: string
    dedupeKey: string
    payload: JsonNullValueInput | InputJsonValue
    sentAt?: Date | string
  }

  export type DiscordAlertLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    alertType?: StringFieldUpdateOperationsInput | string
    dedupeKey?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    sentAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DiscordAlertLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    alertType?: StringFieldUpdateOperationsInput | string
    dedupeKey?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    sentAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type EnumProductStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusFilter<$PrismaModel> | $Enums.ProductStatus
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type CodeListRelationFilter = {
    every?: CodeWhereInput
    some?: CodeWhereInput
    none?: CodeWhereInput
  }

  export type OrderItemListRelationFilter = {
    every?: OrderItemWhereInput
    some?: OrderItemWhereInput
    none?: OrderItemWhereInput
  }

  export type InventoryAlertStateNullableScalarRelationFilter = {
    is?: InventoryAlertStateWhereInput | null
    isNot?: InventoryAlertStateWhereInput | null
  }

  export type MailTemplateNullableScalarRelationFilter = {
    is?: MailTemplateWhereInput | null
    isNot?: MailTemplateWhereInput | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type CodeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    internalProductCode?: SortOrder
    naverProductId?: SortOrder
    sellerManagementCode?: SortOrder
    emailOptionName?: SortOrder
    mailTemplateId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductAvgOrderByAggregateInput = {
    price?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    internalProductCode?: SortOrder
    naverProductId?: SortOrder
    sellerManagementCode?: SortOrder
    emailOptionName?: SortOrder
    mailTemplateId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    internalProductCode?: SortOrder
    naverProductId?: SortOrder
    sellerManagementCode?: SortOrder
    emailOptionName?: SortOrder
    mailTemplateId?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProductSumOrderByAggregateInput = {
    price?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumProductStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProductStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProductStatusFilter<$PrismaModel>
    _max?: NestedEnumProductStatusFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumCodeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CodeStatus | EnumCodeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CodeStatus[] | ListEnumCodeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CodeStatus[] | ListEnumCodeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCodeStatusFilter<$PrismaModel> | $Enums.CodeStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ProductScalarRelationFilter = {
    is?: ProductWhereInput
    isNot?: ProductWhereInput
  }

  export type CodeAssignmentListRelationFilter = {
    every?: CodeAssignmentWhereInput
    some?: CodeAssignmentWhereInput
    none?: CodeAssignmentWhereInput
  }

  export type CodeAssignmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CodeProductIdSequenceNoCompoundUniqueInput = {
    productId: string
    sequenceNo: number
  }

  export type CodeCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    codeValue?: SortOrder
    sequenceNo?: SortOrder
    status?: SortOrder
    reservedAt?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CodeAvgOrderByAggregateInput = {
    sequenceNo?: SortOrder
  }

  export type CodeMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    codeValue?: SortOrder
    sequenceNo?: SortOrder
    status?: SortOrder
    reservedAt?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CodeMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    codeValue?: SortOrder
    sequenceNo?: SortOrder
    status?: SortOrder
    reservedAt?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type CodeSumOrderByAggregateInput = {
    sequenceNo?: SortOrder
  }

  export type EnumCodeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CodeStatus | EnumCodeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CodeStatus[] | ListEnumCodeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CodeStatus[] | ListEnumCodeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCodeStatusWithAggregatesFilter<$PrismaModel> | $Enums.CodeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCodeStatusFilter<$PrismaModel>
    _max?: NestedEnumCodeStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumPlatformFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformFilter<$PrismaModel> | $Enums.Platform
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type OrderCountOrderByAggregateInput = {
    id?: SortOrder
    platform?: SortOrder
    naverOrderId?: SortOrder
    ownOrderId?: SortOrder
    orderStatus?: SortOrder
    ordererName?: SortOrder
    paidAt?: SortOrder
    totalAmount?: SortOrder
    rawPayload?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderAvgOrderByAggregateInput = {
    totalAmount?: SortOrder
  }

  export type OrderMaxOrderByAggregateInput = {
    id?: SortOrder
    platform?: SortOrder
    naverOrderId?: SortOrder
    ownOrderId?: SortOrder
    orderStatus?: SortOrder
    ordererName?: SortOrder
    paidAt?: SortOrder
    totalAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderMinOrderByAggregateInput = {
    id?: SortOrder
    platform?: SortOrder
    naverOrderId?: SortOrder
    ownOrderId?: SortOrder
    orderStatus?: SortOrder
    ordererName?: SortOrder
    paidAt?: SortOrder
    totalAmount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderSumOrderByAggregateInput = {
    totalAmount?: SortOrder
  }

  export type EnumPlatformWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformWithAggregatesFilter<$PrismaModel> | $Enums.Platform
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlatformFilter<$PrismaModel>
    _max?: NestedEnumPlatformFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumOrderItemFulfillmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderItemFulfillmentStatus | EnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderItemFulfillmentStatus[] | ListEnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderItemFulfillmentStatus[] | ListEnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderItemFulfillmentStatusFilter<$PrismaModel> | $Enums.OrderItemFulfillmentStatus
  }

  export type OrderScalarRelationFilter = {
    is?: OrderWhereInput
    isNot?: OrderWhereInput
  }

  export type ProductNullableScalarRelationFilter = {
    is?: ProductWhereInput | null
    isNot?: ProductWhereInput | null
  }

  export type CodeAssignmentNullableScalarRelationFilter = {
    is?: CodeAssignmentWhereInput | null
    isNot?: CodeAssignmentWhereInput | null
  }

  export type FulfillmentJobListRelationFilter = {
    every?: FulfillmentJobWhereInput
    some?: FulfillmentJobWhereInput
    none?: FulfillmentJobWhereInput
  }

  export type EmailLogListRelationFilter = {
    every?: EmailLogWhereInput
    some?: EmailLogWhereInput
    none?: EmailLogWhereInput
  }

  export type FulfillmentJobOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type EmailLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderItemCountOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    productOrderId?: SortOrder
    productName?: SortOrder
    quantity?: SortOrder
    buyerEmail?: SortOrder
    unitPrice?: SortOrder
    fulfillmentStatus?: SortOrder
    failureReasonCode?: SortOrder
    failureReasonDetail?: SortOrder
    paidAt?: SortOrder
    processedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderItemAvgOrderByAggregateInput = {
    quantity?: SortOrder
    unitPrice?: SortOrder
  }

  export type OrderItemMaxOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    productOrderId?: SortOrder
    productName?: SortOrder
    quantity?: SortOrder
    buyerEmail?: SortOrder
    unitPrice?: SortOrder
    fulfillmentStatus?: SortOrder
    failureReasonCode?: SortOrder
    failureReasonDetail?: SortOrder
    paidAt?: SortOrder
    processedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderItemMinOrderByAggregateInput = {
    id?: SortOrder
    orderId?: SortOrder
    productId?: SortOrder
    productOrderId?: SortOrder
    productName?: SortOrder
    quantity?: SortOrder
    buyerEmail?: SortOrder
    unitPrice?: SortOrder
    fulfillmentStatus?: SortOrder
    failureReasonCode?: SortOrder
    failureReasonDetail?: SortOrder
    paidAt?: SortOrder
    processedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderItemSumOrderByAggregateInput = {
    quantity?: SortOrder
    unitPrice?: SortOrder
  }

  export type EnumOrderItemFulfillmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderItemFulfillmentStatus | EnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderItemFulfillmentStatus[] | ListEnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderItemFulfillmentStatus[] | ListEnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderItemFulfillmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderItemFulfillmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderItemFulfillmentStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderItemFulfillmentStatusFilter<$PrismaModel>
  }

  export type EnumCodeAssignmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CodeAssignmentStatus | EnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CodeAssignmentStatus[] | ListEnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CodeAssignmentStatus[] | ListEnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCodeAssignmentStatusFilter<$PrismaModel> | $Enums.CodeAssignmentStatus
  }

  export type OrderItemScalarRelationFilter = {
    is?: OrderItemWhereInput
    isNot?: OrderItemWhereInput
  }

  export type CodeScalarRelationFilter = {
    is?: CodeWhereInput
    isNot?: CodeWhereInput
  }

  export type CodeAssignmentCountOrderByAggregateInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    codeId?: SortOrder
    status?: SortOrder
    assignedAt?: SortOrder
    sentAt?: SortOrder
  }

  export type CodeAssignmentMaxOrderByAggregateInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    codeId?: SortOrder
    status?: SortOrder
    assignedAt?: SortOrder
    sentAt?: SortOrder
  }

  export type CodeAssignmentMinOrderByAggregateInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    codeId?: SortOrder
    status?: SortOrder
    assignedAt?: SortOrder
    sentAt?: SortOrder
  }

  export type EnumCodeAssignmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CodeAssignmentStatus | EnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CodeAssignmentStatus[] | ListEnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CodeAssignmentStatus[] | ListEnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCodeAssignmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.CodeAssignmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCodeAssignmentStatusFilter<$PrismaModel>
    _max?: NestedEnumCodeAssignmentStatusFilter<$PrismaModel>
  }

  export type EnumFulfillmentJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.FulfillmentJobStatus | EnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FulfillmentJobStatus[] | ListEnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FulfillmentJobStatus[] | ListEnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFulfillmentJobStatusFilter<$PrismaModel> | $Enums.FulfillmentJobStatus
  }

  export type FulfillmentJobCountOrderByAggregateInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    jobType?: SortOrder
    status?: SortOrder
    retryCount?: SortOrder
    errorMessage?: SortOrder
    context?: SortOrder
    processedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type FulfillmentJobAvgOrderByAggregateInput = {
    retryCount?: SortOrder
  }

  export type FulfillmentJobMaxOrderByAggregateInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    jobType?: SortOrder
    status?: SortOrder
    retryCount?: SortOrder
    errorMessage?: SortOrder
    processedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type FulfillmentJobMinOrderByAggregateInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    jobType?: SortOrder
    status?: SortOrder
    retryCount?: SortOrder
    errorMessage?: SortOrder
    processedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type FulfillmentJobSumOrderByAggregateInput = {
    retryCount?: SortOrder
  }

  export type EnumFulfillmentJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FulfillmentJobStatus | EnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FulfillmentJobStatus[] | ListEnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FulfillmentJobStatus[] | ListEnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFulfillmentJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.FulfillmentJobStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFulfillmentJobStatusFilter<$PrismaModel>
    _max?: NestedEnumFulfillmentJobStatusFilter<$PrismaModel>
  }

  export type EnumEmailLogStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EmailLogStatus | EnumEmailLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EmailLogStatus[] | ListEnumEmailLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmailLogStatus[] | ListEnumEmailLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEmailLogStatusFilter<$PrismaModel> | $Enums.EmailLogStatus
  }

  export type EmailLogCountOrderByAggregateInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    recipientEmail?: SortOrder
    provider?: SortOrder
    providerMessageId?: SortOrder
    templateName?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type EmailLogMaxOrderByAggregateInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    recipientEmail?: SortOrder
    provider?: SortOrder
    providerMessageId?: SortOrder
    templateName?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type EmailLogMinOrderByAggregateInput = {
    id?: SortOrder
    orderItemId?: SortOrder
    recipientEmail?: SortOrder
    provider?: SortOrder
    providerMessageId?: SortOrder
    templateName?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type EnumEmailLogStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EmailLogStatus | EnumEmailLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EmailLogStatus[] | ListEnumEmailLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmailLogStatus[] | ListEnumEmailLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEmailLogStatusWithAggregatesFilter<$PrismaModel> | $Enums.EmailLogStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEmailLogStatusFilter<$PrismaModel>
    _max?: NestedEnumEmailLogStatusFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ProductListRelationFilter = {
    every?: ProductWhereInput
    some?: ProductWhereInput
    none?: ProductWhereInput
  }

  export type ProductOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MailTemplateCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    subject?: SortOrder
    bodyHtml?: SortOrder
    bodyText?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MailTemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    subject?: SortOrder
    bodyHtml?: SortOrder
    bodyText?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MailTemplateMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    subject?: SortOrder
    bodyHtml?: SortOrder
    bodyText?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type InventoryAlertStateCountOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    lowStockAlertSent?: SortOrder
    outOfStockAlertSent?: SortOrder
    lastKnownAvailableCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type InventoryAlertStateAvgOrderByAggregateInput = {
    lastKnownAvailableCount?: SortOrder
  }

  export type InventoryAlertStateMaxOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    lowStockAlertSent?: SortOrder
    outOfStockAlertSent?: SortOrder
    lastKnownAvailableCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type InventoryAlertStateMinOrderByAggregateInput = {
    id?: SortOrder
    productId?: SortOrder
    lowStockAlertSent?: SortOrder
    outOfStockAlertSent?: SortOrder
    lastKnownAvailableCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type InventoryAlertStateSumOrderByAggregateInput = {
    lastKnownAvailableCount?: SortOrder
  }

  export type SystemSettingCountOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    isSecret?: SortOrder
    updatedAt?: SortOrder
  }

  export type SystemSettingMaxOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    isSecret?: SortOrder
    updatedAt?: SortOrder
  }

  export type SystemSettingMinOrderByAggregateInput = {
    id?: SortOrder
    key?: SortOrder
    value?: SortOrder
    isSecret?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type DiscordAlertLogCountOrderByAggregateInput = {
    id?: SortOrder
    alertType?: SortOrder
    dedupeKey?: SortOrder
    payload?: SortOrder
    sentAt?: SortOrder
  }

  export type DiscordAlertLogMaxOrderByAggregateInput = {
    id?: SortOrder
    alertType?: SortOrder
    dedupeKey?: SortOrder
    sentAt?: SortOrder
  }

  export type DiscordAlertLogMinOrderByAggregateInput = {
    id?: SortOrder
    alertType?: SortOrder
    dedupeKey?: SortOrder
    sentAt?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type CodeCreateNestedManyWithoutProductInput = {
    create?: XOR<CodeCreateWithoutProductInput, CodeUncheckedCreateWithoutProductInput> | CodeCreateWithoutProductInput[] | CodeUncheckedCreateWithoutProductInput[]
    connectOrCreate?: CodeCreateOrConnectWithoutProductInput | CodeCreateOrConnectWithoutProductInput[]
    createMany?: CodeCreateManyProductInputEnvelope
    connect?: CodeWhereUniqueInput | CodeWhereUniqueInput[]
  }

  export type OrderItemCreateNestedManyWithoutProductInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type InventoryAlertStateCreateNestedOneWithoutProductInput = {
    create?: XOR<InventoryAlertStateCreateWithoutProductInput, InventoryAlertStateUncheckedCreateWithoutProductInput>
    connectOrCreate?: InventoryAlertStateCreateOrConnectWithoutProductInput
    connect?: InventoryAlertStateWhereUniqueInput
  }

  export type MailTemplateCreateNestedOneWithoutProductsInput = {
    create?: XOR<MailTemplateCreateWithoutProductsInput, MailTemplateUncheckedCreateWithoutProductsInput>
    connectOrCreate?: MailTemplateCreateOrConnectWithoutProductsInput
    connect?: MailTemplateWhereUniqueInput
  }

  export type CodeUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<CodeCreateWithoutProductInput, CodeUncheckedCreateWithoutProductInput> | CodeCreateWithoutProductInput[] | CodeUncheckedCreateWithoutProductInput[]
    connectOrCreate?: CodeCreateOrConnectWithoutProductInput | CodeCreateOrConnectWithoutProductInput[]
    createMany?: CodeCreateManyProductInputEnvelope
    connect?: CodeWhereUniqueInput | CodeWhereUniqueInput[]
  }

  export type OrderItemUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type InventoryAlertStateUncheckedCreateNestedOneWithoutProductInput = {
    create?: XOR<InventoryAlertStateCreateWithoutProductInput, InventoryAlertStateUncheckedCreateWithoutProductInput>
    connectOrCreate?: InventoryAlertStateCreateOrConnectWithoutProductInput
    connect?: InventoryAlertStateWhereUniqueInput
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumProductStatusFieldUpdateOperationsInput = {
    set?: $Enums.ProductStatus
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type CodeUpdateManyWithoutProductNestedInput = {
    create?: XOR<CodeCreateWithoutProductInput, CodeUncheckedCreateWithoutProductInput> | CodeCreateWithoutProductInput[] | CodeUncheckedCreateWithoutProductInput[]
    connectOrCreate?: CodeCreateOrConnectWithoutProductInput | CodeCreateOrConnectWithoutProductInput[]
    upsert?: CodeUpsertWithWhereUniqueWithoutProductInput | CodeUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: CodeCreateManyProductInputEnvelope
    set?: CodeWhereUniqueInput | CodeWhereUniqueInput[]
    disconnect?: CodeWhereUniqueInput | CodeWhereUniqueInput[]
    delete?: CodeWhereUniqueInput | CodeWhereUniqueInput[]
    connect?: CodeWhereUniqueInput | CodeWhereUniqueInput[]
    update?: CodeUpdateWithWhereUniqueWithoutProductInput | CodeUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: CodeUpdateManyWithWhereWithoutProductInput | CodeUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: CodeScalarWhereInput | CodeScalarWhereInput[]
  }

  export type OrderItemUpdateManyWithoutProductNestedInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutProductInput | OrderItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutProductInput | OrderItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutProductInput | OrderItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type InventoryAlertStateUpdateOneWithoutProductNestedInput = {
    create?: XOR<InventoryAlertStateCreateWithoutProductInput, InventoryAlertStateUncheckedCreateWithoutProductInput>
    connectOrCreate?: InventoryAlertStateCreateOrConnectWithoutProductInput
    upsert?: InventoryAlertStateUpsertWithoutProductInput
    disconnect?: InventoryAlertStateWhereInput | boolean
    delete?: InventoryAlertStateWhereInput | boolean
    connect?: InventoryAlertStateWhereUniqueInput
    update?: XOR<XOR<InventoryAlertStateUpdateToOneWithWhereWithoutProductInput, InventoryAlertStateUpdateWithoutProductInput>, InventoryAlertStateUncheckedUpdateWithoutProductInput>
  }

  export type MailTemplateUpdateOneWithoutProductsNestedInput = {
    create?: XOR<MailTemplateCreateWithoutProductsInput, MailTemplateUncheckedCreateWithoutProductsInput>
    connectOrCreate?: MailTemplateCreateOrConnectWithoutProductsInput
    upsert?: MailTemplateUpsertWithoutProductsInput
    disconnect?: MailTemplateWhereInput | boolean
    delete?: MailTemplateWhereInput | boolean
    connect?: MailTemplateWhereUniqueInput
    update?: XOR<XOR<MailTemplateUpdateToOneWithWhereWithoutProductsInput, MailTemplateUpdateWithoutProductsInput>, MailTemplateUncheckedUpdateWithoutProductsInput>
  }

  export type CodeUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<CodeCreateWithoutProductInput, CodeUncheckedCreateWithoutProductInput> | CodeCreateWithoutProductInput[] | CodeUncheckedCreateWithoutProductInput[]
    connectOrCreate?: CodeCreateOrConnectWithoutProductInput | CodeCreateOrConnectWithoutProductInput[]
    upsert?: CodeUpsertWithWhereUniqueWithoutProductInput | CodeUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: CodeCreateManyProductInputEnvelope
    set?: CodeWhereUniqueInput | CodeWhereUniqueInput[]
    disconnect?: CodeWhereUniqueInput | CodeWhereUniqueInput[]
    delete?: CodeWhereUniqueInput | CodeWhereUniqueInput[]
    connect?: CodeWhereUniqueInput | CodeWhereUniqueInput[]
    update?: CodeUpdateWithWhereUniqueWithoutProductInput | CodeUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: CodeUpdateManyWithWhereWithoutProductInput | CodeUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: CodeScalarWhereInput | CodeScalarWhereInput[]
  }

  export type OrderItemUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput> | OrderItemCreateWithoutProductInput[] | OrderItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutProductInput | OrderItemCreateOrConnectWithoutProductInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutProductInput | OrderItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: OrderItemCreateManyProductInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutProductInput | OrderItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutProductInput | OrderItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type InventoryAlertStateUncheckedUpdateOneWithoutProductNestedInput = {
    create?: XOR<InventoryAlertStateCreateWithoutProductInput, InventoryAlertStateUncheckedCreateWithoutProductInput>
    connectOrCreate?: InventoryAlertStateCreateOrConnectWithoutProductInput
    upsert?: InventoryAlertStateUpsertWithoutProductInput
    disconnect?: InventoryAlertStateWhereInput | boolean
    delete?: InventoryAlertStateWhereInput | boolean
    connect?: InventoryAlertStateWhereUniqueInput
    update?: XOR<XOR<InventoryAlertStateUpdateToOneWithWhereWithoutProductInput, InventoryAlertStateUpdateWithoutProductInput>, InventoryAlertStateUncheckedUpdateWithoutProductInput>
  }

  export type ProductCreateNestedOneWithoutCodesInput = {
    create?: XOR<ProductCreateWithoutCodesInput, ProductUncheckedCreateWithoutCodesInput>
    connectOrCreate?: ProductCreateOrConnectWithoutCodesInput
    connect?: ProductWhereUniqueInput
  }

  export type CodeAssignmentCreateNestedManyWithoutCodeInput = {
    create?: XOR<CodeAssignmentCreateWithoutCodeInput, CodeAssignmentUncheckedCreateWithoutCodeInput> | CodeAssignmentCreateWithoutCodeInput[] | CodeAssignmentUncheckedCreateWithoutCodeInput[]
    connectOrCreate?: CodeAssignmentCreateOrConnectWithoutCodeInput | CodeAssignmentCreateOrConnectWithoutCodeInput[]
    createMany?: CodeAssignmentCreateManyCodeInputEnvelope
    connect?: CodeAssignmentWhereUniqueInput | CodeAssignmentWhereUniqueInput[]
  }

  export type CodeAssignmentUncheckedCreateNestedManyWithoutCodeInput = {
    create?: XOR<CodeAssignmentCreateWithoutCodeInput, CodeAssignmentUncheckedCreateWithoutCodeInput> | CodeAssignmentCreateWithoutCodeInput[] | CodeAssignmentUncheckedCreateWithoutCodeInput[]
    connectOrCreate?: CodeAssignmentCreateOrConnectWithoutCodeInput | CodeAssignmentCreateOrConnectWithoutCodeInput[]
    createMany?: CodeAssignmentCreateManyCodeInputEnvelope
    connect?: CodeAssignmentWhereUniqueInput | CodeAssignmentWhereUniqueInput[]
  }

  export type EnumCodeStatusFieldUpdateOperationsInput = {
    set?: $Enums.CodeStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ProductUpdateOneRequiredWithoutCodesNestedInput = {
    create?: XOR<ProductCreateWithoutCodesInput, ProductUncheckedCreateWithoutCodesInput>
    connectOrCreate?: ProductCreateOrConnectWithoutCodesInput
    upsert?: ProductUpsertWithoutCodesInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutCodesInput, ProductUpdateWithoutCodesInput>, ProductUncheckedUpdateWithoutCodesInput>
  }

  export type CodeAssignmentUpdateManyWithoutCodeNestedInput = {
    create?: XOR<CodeAssignmentCreateWithoutCodeInput, CodeAssignmentUncheckedCreateWithoutCodeInput> | CodeAssignmentCreateWithoutCodeInput[] | CodeAssignmentUncheckedCreateWithoutCodeInput[]
    connectOrCreate?: CodeAssignmentCreateOrConnectWithoutCodeInput | CodeAssignmentCreateOrConnectWithoutCodeInput[]
    upsert?: CodeAssignmentUpsertWithWhereUniqueWithoutCodeInput | CodeAssignmentUpsertWithWhereUniqueWithoutCodeInput[]
    createMany?: CodeAssignmentCreateManyCodeInputEnvelope
    set?: CodeAssignmentWhereUniqueInput | CodeAssignmentWhereUniqueInput[]
    disconnect?: CodeAssignmentWhereUniqueInput | CodeAssignmentWhereUniqueInput[]
    delete?: CodeAssignmentWhereUniqueInput | CodeAssignmentWhereUniqueInput[]
    connect?: CodeAssignmentWhereUniqueInput | CodeAssignmentWhereUniqueInput[]
    update?: CodeAssignmentUpdateWithWhereUniqueWithoutCodeInput | CodeAssignmentUpdateWithWhereUniqueWithoutCodeInput[]
    updateMany?: CodeAssignmentUpdateManyWithWhereWithoutCodeInput | CodeAssignmentUpdateManyWithWhereWithoutCodeInput[]
    deleteMany?: CodeAssignmentScalarWhereInput | CodeAssignmentScalarWhereInput[]
  }

  export type CodeAssignmentUncheckedUpdateManyWithoutCodeNestedInput = {
    create?: XOR<CodeAssignmentCreateWithoutCodeInput, CodeAssignmentUncheckedCreateWithoutCodeInput> | CodeAssignmentCreateWithoutCodeInput[] | CodeAssignmentUncheckedCreateWithoutCodeInput[]
    connectOrCreate?: CodeAssignmentCreateOrConnectWithoutCodeInput | CodeAssignmentCreateOrConnectWithoutCodeInput[]
    upsert?: CodeAssignmentUpsertWithWhereUniqueWithoutCodeInput | CodeAssignmentUpsertWithWhereUniqueWithoutCodeInput[]
    createMany?: CodeAssignmentCreateManyCodeInputEnvelope
    set?: CodeAssignmentWhereUniqueInput | CodeAssignmentWhereUniqueInput[]
    disconnect?: CodeAssignmentWhereUniqueInput | CodeAssignmentWhereUniqueInput[]
    delete?: CodeAssignmentWhereUniqueInput | CodeAssignmentWhereUniqueInput[]
    connect?: CodeAssignmentWhereUniqueInput | CodeAssignmentWhereUniqueInput[]
    update?: CodeAssignmentUpdateWithWhereUniqueWithoutCodeInput | CodeAssignmentUpdateWithWhereUniqueWithoutCodeInput[]
    updateMany?: CodeAssignmentUpdateManyWithWhereWithoutCodeInput | CodeAssignmentUpdateManyWithWhereWithoutCodeInput[]
    deleteMany?: CodeAssignmentScalarWhereInput | CodeAssignmentScalarWhereInput[]
  }

  export type OrderItemCreateNestedManyWithoutOrderInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type OrderItemUncheckedCreateNestedManyWithoutOrderInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
  }

  export type EnumPlatformFieldUpdateOperationsInput = {
    set?: $Enums.Platform
  }

  export type OrderItemUpdateManyWithoutOrderNestedInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutOrderInput | OrderItemUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutOrderInput | OrderItemUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutOrderInput | OrderItemUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type OrderItemUncheckedUpdateManyWithoutOrderNestedInput = {
    create?: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput> | OrderItemCreateWithoutOrderInput[] | OrderItemUncheckedCreateWithoutOrderInput[]
    connectOrCreate?: OrderItemCreateOrConnectWithoutOrderInput | OrderItemCreateOrConnectWithoutOrderInput[]
    upsert?: OrderItemUpsertWithWhereUniqueWithoutOrderInput | OrderItemUpsertWithWhereUniqueWithoutOrderInput[]
    createMany?: OrderItemCreateManyOrderInputEnvelope
    set?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    disconnect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    delete?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    connect?: OrderItemWhereUniqueInput | OrderItemWhereUniqueInput[]
    update?: OrderItemUpdateWithWhereUniqueWithoutOrderInput | OrderItemUpdateWithWhereUniqueWithoutOrderInput[]
    updateMany?: OrderItemUpdateManyWithWhereWithoutOrderInput | OrderItemUpdateManyWithWhereWithoutOrderInput[]
    deleteMany?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
  }

  export type OrderCreateNestedOneWithoutOrderItemsInput = {
    create?: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutOrderItemsInput
    connect?: OrderWhereUniqueInput
  }

  export type ProductCreateNestedOneWithoutOrderItemsInput = {
    create?: XOR<ProductCreateWithoutOrderItemsInput, ProductUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutOrderItemsInput
    connect?: ProductWhereUniqueInput
  }

  export type CodeAssignmentCreateNestedOneWithoutOrderItemInput = {
    create?: XOR<CodeAssignmentCreateWithoutOrderItemInput, CodeAssignmentUncheckedCreateWithoutOrderItemInput>
    connectOrCreate?: CodeAssignmentCreateOrConnectWithoutOrderItemInput
    connect?: CodeAssignmentWhereUniqueInput
  }

  export type FulfillmentJobCreateNestedManyWithoutOrderItemInput = {
    create?: XOR<FulfillmentJobCreateWithoutOrderItemInput, FulfillmentJobUncheckedCreateWithoutOrderItemInput> | FulfillmentJobCreateWithoutOrderItemInput[] | FulfillmentJobUncheckedCreateWithoutOrderItemInput[]
    connectOrCreate?: FulfillmentJobCreateOrConnectWithoutOrderItemInput | FulfillmentJobCreateOrConnectWithoutOrderItemInput[]
    createMany?: FulfillmentJobCreateManyOrderItemInputEnvelope
    connect?: FulfillmentJobWhereUniqueInput | FulfillmentJobWhereUniqueInput[]
  }

  export type EmailLogCreateNestedManyWithoutOrderItemInput = {
    create?: XOR<EmailLogCreateWithoutOrderItemInput, EmailLogUncheckedCreateWithoutOrderItemInput> | EmailLogCreateWithoutOrderItemInput[] | EmailLogUncheckedCreateWithoutOrderItemInput[]
    connectOrCreate?: EmailLogCreateOrConnectWithoutOrderItemInput | EmailLogCreateOrConnectWithoutOrderItemInput[]
    createMany?: EmailLogCreateManyOrderItemInputEnvelope
    connect?: EmailLogWhereUniqueInput | EmailLogWhereUniqueInput[]
  }

  export type CodeAssignmentUncheckedCreateNestedOneWithoutOrderItemInput = {
    create?: XOR<CodeAssignmentCreateWithoutOrderItemInput, CodeAssignmentUncheckedCreateWithoutOrderItemInput>
    connectOrCreate?: CodeAssignmentCreateOrConnectWithoutOrderItemInput
    connect?: CodeAssignmentWhereUniqueInput
  }

  export type FulfillmentJobUncheckedCreateNestedManyWithoutOrderItemInput = {
    create?: XOR<FulfillmentJobCreateWithoutOrderItemInput, FulfillmentJobUncheckedCreateWithoutOrderItemInput> | FulfillmentJobCreateWithoutOrderItemInput[] | FulfillmentJobUncheckedCreateWithoutOrderItemInput[]
    connectOrCreate?: FulfillmentJobCreateOrConnectWithoutOrderItemInput | FulfillmentJobCreateOrConnectWithoutOrderItemInput[]
    createMany?: FulfillmentJobCreateManyOrderItemInputEnvelope
    connect?: FulfillmentJobWhereUniqueInput | FulfillmentJobWhereUniqueInput[]
  }

  export type EmailLogUncheckedCreateNestedManyWithoutOrderItemInput = {
    create?: XOR<EmailLogCreateWithoutOrderItemInput, EmailLogUncheckedCreateWithoutOrderItemInput> | EmailLogCreateWithoutOrderItemInput[] | EmailLogUncheckedCreateWithoutOrderItemInput[]
    connectOrCreate?: EmailLogCreateOrConnectWithoutOrderItemInput | EmailLogCreateOrConnectWithoutOrderItemInput[]
    createMany?: EmailLogCreateManyOrderItemInputEnvelope
    connect?: EmailLogWhereUniqueInput | EmailLogWhereUniqueInput[]
  }

  export type EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput = {
    set?: $Enums.OrderItemFulfillmentStatus
  }

  export type OrderUpdateOneRequiredWithoutOrderItemsNestedInput = {
    create?: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: OrderCreateOrConnectWithoutOrderItemsInput
    upsert?: OrderUpsertWithoutOrderItemsInput
    connect?: OrderWhereUniqueInput
    update?: XOR<XOR<OrderUpdateToOneWithWhereWithoutOrderItemsInput, OrderUpdateWithoutOrderItemsInput>, OrderUncheckedUpdateWithoutOrderItemsInput>
  }

  export type ProductUpdateOneWithoutOrderItemsNestedInput = {
    create?: XOR<ProductCreateWithoutOrderItemsInput, ProductUncheckedCreateWithoutOrderItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutOrderItemsInput
    upsert?: ProductUpsertWithoutOrderItemsInput
    disconnect?: ProductWhereInput | boolean
    delete?: ProductWhereInput | boolean
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutOrderItemsInput, ProductUpdateWithoutOrderItemsInput>, ProductUncheckedUpdateWithoutOrderItemsInput>
  }

  export type CodeAssignmentUpdateOneWithoutOrderItemNestedInput = {
    create?: XOR<CodeAssignmentCreateWithoutOrderItemInput, CodeAssignmentUncheckedCreateWithoutOrderItemInput>
    connectOrCreate?: CodeAssignmentCreateOrConnectWithoutOrderItemInput
    upsert?: CodeAssignmentUpsertWithoutOrderItemInput
    disconnect?: CodeAssignmentWhereInput | boolean
    delete?: CodeAssignmentWhereInput | boolean
    connect?: CodeAssignmentWhereUniqueInput
    update?: XOR<XOR<CodeAssignmentUpdateToOneWithWhereWithoutOrderItemInput, CodeAssignmentUpdateWithoutOrderItemInput>, CodeAssignmentUncheckedUpdateWithoutOrderItemInput>
  }

  export type FulfillmentJobUpdateManyWithoutOrderItemNestedInput = {
    create?: XOR<FulfillmentJobCreateWithoutOrderItemInput, FulfillmentJobUncheckedCreateWithoutOrderItemInput> | FulfillmentJobCreateWithoutOrderItemInput[] | FulfillmentJobUncheckedCreateWithoutOrderItemInput[]
    connectOrCreate?: FulfillmentJobCreateOrConnectWithoutOrderItemInput | FulfillmentJobCreateOrConnectWithoutOrderItemInput[]
    upsert?: FulfillmentJobUpsertWithWhereUniqueWithoutOrderItemInput | FulfillmentJobUpsertWithWhereUniqueWithoutOrderItemInput[]
    createMany?: FulfillmentJobCreateManyOrderItemInputEnvelope
    set?: FulfillmentJobWhereUniqueInput | FulfillmentJobWhereUniqueInput[]
    disconnect?: FulfillmentJobWhereUniqueInput | FulfillmentJobWhereUniqueInput[]
    delete?: FulfillmentJobWhereUniqueInput | FulfillmentJobWhereUniqueInput[]
    connect?: FulfillmentJobWhereUniqueInput | FulfillmentJobWhereUniqueInput[]
    update?: FulfillmentJobUpdateWithWhereUniqueWithoutOrderItemInput | FulfillmentJobUpdateWithWhereUniqueWithoutOrderItemInput[]
    updateMany?: FulfillmentJobUpdateManyWithWhereWithoutOrderItemInput | FulfillmentJobUpdateManyWithWhereWithoutOrderItemInput[]
    deleteMany?: FulfillmentJobScalarWhereInput | FulfillmentJobScalarWhereInput[]
  }

  export type EmailLogUpdateManyWithoutOrderItemNestedInput = {
    create?: XOR<EmailLogCreateWithoutOrderItemInput, EmailLogUncheckedCreateWithoutOrderItemInput> | EmailLogCreateWithoutOrderItemInput[] | EmailLogUncheckedCreateWithoutOrderItemInput[]
    connectOrCreate?: EmailLogCreateOrConnectWithoutOrderItemInput | EmailLogCreateOrConnectWithoutOrderItemInput[]
    upsert?: EmailLogUpsertWithWhereUniqueWithoutOrderItemInput | EmailLogUpsertWithWhereUniqueWithoutOrderItemInput[]
    createMany?: EmailLogCreateManyOrderItemInputEnvelope
    set?: EmailLogWhereUniqueInput | EmailLogWhereUniqueInput[]
    disconnect?: EmailLogWhereUniqueInput | EmailLogWhereUniqueInput[]
    delete?: EmailLogWhereUniqueInput | EmailLogWhereUniqueInput[]
    connect?: EmailLogWhereUniqueInput | EmailLogWhereUniqueInput[]
    update?: EmailLogUpdateWithWhereUniqueWithoutOrderItemInput | EmailLogUpdateWithWhereUniqueWithoutOrderItemInput[]
    updateMany?: EmailLogUpdateManyWithWhereWithoutOrderItemInput | EmailLogUpdateManyWithWhereWithoutOrderItemInput[]
    deleteMany?: EmailLogScalarWhereInput | EmailLogScalarWhereInput[]
  }

  export type CodeAssignmentUncheckedUpdateOneWithoutOrderItemNestedInput = {
    create?: XOR<CodeAssignmentCreateWithoutOrderItemInput, CodeAssignmentUncheckedCreateWithoutOrderItemInput>
    connectOrCreate?: CodeAssignmentCreateOrConnectWithoutOrderItemInput
    upsert?: CodeAssignmentUpsertWithoutOrderItemInput
    disconnect?: CodeAssignmentWhereInput | boolean
    delete?: CodeAssignmentWhereInput | boolean
    connect?: CodeAssignmentWhereUniqueInput
    update?: XOR<XOR<CodeAssignmentUpdateToOneWithWhereWithoutOrderItemInput, CodeAssignmentUpdateWithoutOrderItemInput>, CodeAssignmentUncheckedUpdateWithoutOrderItemInput>
  }

  export type FulfillmentJobUncheckedUpdateManyWithoutOrderItemNestedInput = {
    create?: XOR<FulfillmentJobCreateWithoutOrderItemInput, FulfillmentJobUncheckedCreateWithoutOrderItemInput> | FulfillmentJobCreateWithoutOrderItemInput[] | FulfillmentJobUncheckedCreateWithoutOrderItemInput[]
    connectOrCreate?: FulfillmentJobCreateOrConnectWithoutOrderItemInput | FulfillmentJobCreateOrConnectWithoutOrderItemInput[]
    upsert?: FulfillmentJobUpsertWithWhereUniqueWithoutOrderItemInput | FulfillmentJobUpsertWithWhereUniqueWithoutOrderItemInput[]
    createMany?: FulfillmentJobCreateManyOrderItemInputEnvelope
    set?: FulfillmentJobWhereUniqueInput | FulfillmentJobWhereUniqueInput[]
    disconnect?: FulfillmentJobWhereUniqueInput | FulfillmentJobWhereUniqueInput[]
    delete?: FulfillmentJobWhereUniqueInput | FulfillmentJobWhereUniqueInput[]
    connect?: FulfillmentJobWhereUniqueInput | FulfillmentJobWhereUniqueInput[]
    update?: FulfillmentJobUpdateWithWhereUniqueWithoutOrderItemInput | FulfillmentJobUpdateWithWhereUniqueWithoutOrderItemInput[]
    updateMany?: FulfillmentJobUpdateManyWithWhereWithoutOrderItemInput | FulfillmentJobUpdateManyWithWhereWithoutOrderItemInput[]
    deleteMany?: FulfillmentJobScalarWhereInput | FulfillmentJobScalarWhereInput[]
  }

  export type EmailLogUncheckedUpdateManyWithoutOrderItemNestedInput = {
    create?: XOR<EmailLogCreateWithoutOrderItemInput, EmailLogUncheckedCreateWithoutOrderItemInput> | EmailLogCreateWithoutOrderItemInput[] | EmailLogUncheckedCreateWithoutOrderItemInput[]
    connectOrCreate?: EmailLogCreateOrConnectWithoutOrderItemInput | EmailLogCreateOrConnectWithoutOrderItemInput[]
    upsert?: EmailLogUpsertWithWhereUniqueWithoutOrderItemInput | EmailLogUpsertWithWhereUniqueWithoutOrderItemInput[]
    createMany?: EmailLogCreateManyOrderItemInputEnvelope
    set?: EmailLogWhereUniqueInput | EmailLogWhereUniqueInput[]
    disconnect?: EmailLogWhereUniqueInput | EmailLogWhereUniqueInput[]
    delete?: EmailLogWhereUniqueInput | EmailLogWhereUniqueInput[]
    connect?: EmailLogWhereUniqueInput | EmailLogWhereUniqueInput[]
    update?: EmailLogUpdateWithWhereUniqueWithoutOrderItemInput | EmailLogUpdateWithWhereUniqueWithoutOrderItemInput[]
    updateMany?: EmailLogUpdateManyWithWhereWithoutOrderItemInput | EmailLogUpdateManyWithWhereWithoutOrderItemInput[]
    deleteMany?: EmailLogScalarWhereInput | EmailLogScalarWhereInput[]
  }

  export type OrderItemCreateNestedOneWithoutCodeAssignmentInput = {
    create?: XOR<OrderItemCreateWithoutCodeAssignmentInput, OrderItemUncheckedCreateWithoutCodeAssignmentInput>
    connectOrCreate?: OrderItemCreateOrConnectWithoutCodeAssignmentInput
    connect?: OrderItemWhereUniqueInput
  }

  export type CodeCreateNestedOneWithoutAssignmentsInput = {
    create?: XOR<CodeCreateWithoutAssignmentsInput, CodeUncheckedCreateWithoutAssignmentsInput>
    connectOrCreate?: CodeCreateOrConnectWithoutAssignmentsInput
    connect?: CodeWhereUniqueInput
  }

  export type EnumCodeAssignmentStatusFieldUpdateOperationsInput = {
    set?: $Enums.CodeAssignmentStatus
  }

  export type OrderItemUpdateOneRequiredWithoutCodeAssignmentNestedInput = {
    create?: XOR<OrderItemCreateWithoutCodeAssignmentInput, OrderItemUncheckedCreateWithoutCodeAssignmentInput>
    connectOrCreate?: OrderItemCreateOrConnectWithoutCodeAssignmentInput
    upsert?: OrderItemUpsertWithoutCodeAssignmentInput
    connect?: OrderItemWhereUniqueInput
    update?: XOR<XOR<OrderItemUpdateToOneWithWhereWithoutCodeAssignmentInput, OrderItemUpdateWithoutCodeAssignmentInput>, OrderItemUncheckedUpdateWithoutCodeAssignmentInput>
  }

  export type CodeUpdateOneRequiredWithoutAssignmentsNestedInput = {
    create?: XOR<CodeCreateWithoutAssignmentsInput, CodeUncheckedCreateWithoutAssignmentsInput>
    connectOrCreate?: CodeCreateOrConnectWithoutAssignmentsInput
    upsert?: CodeUpsertWithoutAssignmentsInput
    connect?: CodeWhereUniqueInput
    update?: XOR<XOR<CodeUpdateToOneWithWhereWithoutAssignmentsInput, CodeUpdateWithoutAssignmentsInput>, CodeUncheckedUpdateWithoutAssignmentsInput>
  }

  export type OrderItemCreateNestedOneWithoutFulfillmentJobsInput = {
    create?: XOR<OrderItemCreateWithoutFulfillmentJobsInput, OrderItemUncheckedCreateWithoutFulfillmentJobsInput>
    connectOrCreate?: OrderItemCreateOrConnectWithoutFulfillmentJobsInput
    connect?: OrderItemWhereUniqueInput
  }

  export type EnumFulfillmentJobStatusFieldUpdateOperationsInput = {
    set?: $Enums.FulfillmentJobStatus
  }

  export type OrderItemUpdateOneRequiredWithoutFulfillmentJobsNestedInput = {
    create?: XOR<OrderItemCreateWithoutFulfillmentJobsInput, OrderItemUncheckedCreateWithoutFulfillmentJobsInput>
    connectOrCreate?: OrderItemCreateOrConnectWithoutFulfillmentJobsInput
    upsert?: OrderItemUpsertWithoutFulfillmentJobsInput
    connect?: OrderItemWhereUniqueInput
    update?: XOR<XOR<OrderItemUpdateToOneWithWhereWithoutFulfillmentJobsInput, OrderItemUpdateWithoutFulfillmentJobsInput>, OrderItemUncheckedUpdateWithoutFulfillmentJobsInput>
  }

  export type OrderItemCreateNestedOneWithoutEmailLogsInput = {
    create?: XOR<OrderItemCreateWithoutEmailLogsInput, OrderItemUncheckedCreateWithoutEmailLogsInput>
    connectOrCreate?: OrderItemCreateOrConnectWithoutEmailLogsInput
    connect?: OrderItemWhereUniqueInput
  }

  export type EnumEmailLogStatusFieldUpdateOperationsInput = {
    set?: $Enums.EmailLogStatus
  }

  export type OrderItemUpdateOneRequiredWithoutEmailLogsNestedInput = {
    create?: XOR<OrderItemCreateWithoutEmailLogsInput, OrderItemUncheckedCreateWithoutEmailLogsInput>
    connectOrCreate?: OrderItemCreateOrConnectWithoutEmailLogsInput
    upsert?: OrderItemUpsertWithoutEmailLogsInput
    connect?: OrderItemWhereUniqueInput
    update?: XOR<XOR<OrderItemUpdateToOneWithWhereWithoutEmailLogsInput, OrderItemUpdateWithoutEmailLogsInput>, OrderItemUncheckedUpdateWithoutEmailLogsInput>
  }

  export type ProductCreateNestedManyWithoutMailTemplateInput = {
    create?: XOR<ProductCreateWithoutMailTemplateInput, ProductUncheckedCreateWithoutMailTemplateInput> | ProductCreateWithoutMailTemplateInput[] | ProductUncheckedCreateWithoutMailTemplateInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutMailTemplateInput | ProductCreateOrConnectWithoutMailTemplateInput[]
    createMany?: ProductCreateManyMailTemplateInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type ProductUncheckedCreateNestedManyWithoutMailTemplateInput = {
    create?: XOR<ProductCreateWithoutMailTemplateInput, ProductUncheckedCreateWithoutMailTemplateInput> | ProductCreateWithoutMailTemplateInput[] | ProductUncheckedCreateWithoutMailTemplateInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutMailTemplateInput | ProductCreateOrConnectWithoutMailTemplateInput[]
    createMany?: ProductCreateManyMailTemplateInputEnvelope
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ProductUpdateManyWithoutMailTemplateNestedInput = {
    create?: XOR<ProductCreateWithoutMailTemplateInput, ProductUncheckedCreateWithoutMailTemplateInput> | ProductCreateWithoutMailTemplateInput[] | ProductUncheckedCreateWithoutMailTemplateInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutMailTemplateInput | ProductCreateOrConnectWithoutMailTemplateInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutMailTemplateInput | ProductUpsertWithWhereUniqueWithoutMailTemplateInput[]
    createMany?: ProductCreateManyMailTemplateInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutMailTemplateInput | ProductUpdateWithWhereUniqueWithoutMailTemplateInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutMailTemplateInput | ProductUpdateManyWithWhereWithoutMailTemplateInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type ProductUncheckedUpdateManyWithoutMailTemplateNestedInput = {
    create?: XOR<ProductCreateWithoutMailTemplateInput, ProductUncheckedCreateWithoutMailTemplateInput> | ProductCreateWithoutMailTemplateInput[] | ProductUncheckedCreateWithoutMailTemplateInput[]
    connectOrCreate?: ProductCreateOrConnectWithoutMailTemplateInput | ProductCreateOrConnectWithoutMailTemplateInput[]
    upsert?: ProductUpsertWithWhereUniqueWithoutMailTemplateInput | ProductUpsertWithWhereUniqueWithoutMailTemplateInput[]
    createMany?: ProductCreateManyMailTemplateInputEnvelope
    set?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    disconnect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    delete?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    connect?: ProductWhereUniqueInput | ProductWhereUniqueInput[]
    update?: ProductUpdateWithWhereUniqueWithoutMailTemplateInput | ProductUpdateWithWhereUniqueWithoutMailTemplateInput[]
    updateMany?: ProductUpdateManyWithWhereWithoutMailTemplateInput | ProductUpdateManyWithWhereWithoutMailTemplateInput[]
    deleteMany?: ProductScalarWhereInput | ProductScalarWhereInput[]
  }

  export type ProductCreateNestedOneWithoutInventoryAlertStateInput = {
    create?: XOR<ProductCreateWithoutInventoryAlertStateInput, ProductUncheckedCreateWithoutInventoryAlertStateInput>
    connectOrCreate?: ProductCreateOrConnectWithoutInventoryAlertStateInput
    connect?: ProductWhereUniqueInput
  }

  export type ProductUpdateOneRequiredWithoutInventoryAlertStateNestedInput = {
    create?: XOR<ProductCreateWithoutInventoryAlertStateInput, ProductUncheckedCreateWithoutInventoryAlertStateInput>
    connectOrCreate?: ProductCreateOrConnectWithoutInventoryAlertStateInput
    upsert?: ProductUpsertWithoutInventoryAlertStateInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutInventoryAlertStateInput, ProductUpdateWithoutInventoryAlertStateInput>, ProductUncheckedUpdateWithoutInventoryAlertStateInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumProductStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusFilter<$PrismaModel> | $Enums.ProductStatus
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumProductStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProductStatus | EnumProductStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProductStatus[] | ListEnumProductStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProductStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProductStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProductStatusFilter<$PrismaModel>
    _max?: NestedEnumProductStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumCodeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CodeStatus | EnumCodeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CodeStatus[] | ListEnumCodeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CodeStatus[] | ListEnumCodeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCodeStatusFilter<$PrismaModel> | $Enums.CodeStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumCodeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CodeStatus | EnumCodeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CodeStatus[] | ListEnumCodeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CodeStatus[] | ListEnumCodeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCodeStatusWithAggregatesFilter<$PrismaModel> | $Enums.CodeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCodeStatusFilter<$PrismaModel>
    _max?: NestedEnumCodeStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumPlatformFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformFilter<$PrismaModel> | $Enums.Platform
  }

  export type NestedEnumPlatformWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Platform | EnumPlatformFieldRefInput<$PrismaModel>
    in?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    notIn?: $Enums.Platform[] | ListEnumPlatformFieldRefInput<$PrismaModel>
    not?: NestedEnumPlatformWithAggregatesFilter<$PrismaModel> | $Enums.Platform
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPlatformFilter<$PrismaModel>
    _max?: NestedEnumPlatformFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumOrderItemFulfillmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderItemFulfillmentStatus | EnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderItemFulfillmentStatus[] | ListEnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderItemFulfillmentStatus[] | ListEnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderItemFulfillmentStatusFilter<$PrismaModel> | $Enums.OrderItemFulfillmentStatus
  }

  export type NestedEnumOrderItemFulfillmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.OrderItemFulfillmentStatus | EnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.OrderItemFulfillmentStatus[] | ListEnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.OrderItemFulfillmentStatus[] | ListEnumOrderItemFulfillmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumOrderItemFulfillmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.OrderItemFulfillmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumOrderItemFulfillmentStatusFilter<$PrismaModel>
    _max?: NestedEnumOrderItemFulfillmentStatusFilter<$PrismaModel>
  }

  export type NestedEnumCodeAssignmentStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.CodeAssignmentStatus | EnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CodeAssignmentStatus[] | ListEnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CodeAssignmentStatus[] | ListEnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCodeAssignmentStatusFilter<$PrismaModel> | $Enums.CodeAssignmentStatus
  }

  export type NestedEnumCodeAssignmentStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CodeAssignmentStatus | EnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    in?: $Enums.CodeAssignmentStatus[] | ListEnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.CodeAssignmentStatus[] | ListEnumCodeAssignmentStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumCodeAssignmentStatusWithAggregatesFilter<$PrismaModel> | $Enums.CodeAssignmentStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCodeAssignmentStatusFilter<$PrismaModel>
    _max?: NestedEnumCodeAssignmentStatusFilter<$PrismaModel>
  }

  export type NestedEnumFulfillmentJobStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.FulfillmentJobStatus | EnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FulfillmentJobStatus[] | ListEnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FulfillmentJobStatus[] | ListEnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFulfillmentJobStatusFilter<$PrismaModel> | $Enums.FulfillmentJobStatus
  }

  export type NestedEnumFulfillmentJobStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.FulfillmentJobStatus | EnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    in?: $Enums.FulfillmentJobStatus[] | ListEnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.FulfillmentJobStatus[] | ListEnumFulfillmentJobStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumFulfillmentJobStatusWithAggregatesFilter<$PrismaModel> | $Enums.FulfillmentJobStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumFulfillmentJobStatusFilter<$PrismaModel>
    _max?: NestedEnumFulfillmentJobStatusFilter<$PrismaModel>
  }

  export type NestedEnumEmailLogStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.EmailLogStatus | EnumEmailLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EmailLogStatus[] | ListEnumEmailLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmailLogStatus[] | ListEnumEmailLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEmailLogStatusFilter<$PrismaModel> | $Enums.EmailLogStatus
  }

  export type NestedEnumEmailLogStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.EmailLogStatus | EnumEmailLogStatusFieldRefInput<$PrismaModel>
    in?: $Enums.EmailLogStatus[] | ListEnumEmailLogStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.EmailLogStatus[] | ListEnumEmailLogStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumEmailLogStatusWithAggregatesFilter<$PrismaModel> | $Enums.EmailLogStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumEmailLogStatusFilter<$PrismaModel>
    _max?: NestedEnumEmailLogStatusFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type CodeCreateWithoutProductInput = {
    id?: string
    codeValue: string
    sequenceNo: number
    status?: $Enums.CodeStatus
    reservedAt?: Date | string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    assignments?: CodeAssignmentCreateNestedManyWithoutCodeInput
  }

  export type CodeUncheckedCreateWithoutProductInput = {
    id?: string
    codeValue: string
    sequenceNo: number
    status?: $Enums.CodeStatus
    reservedAt?: Date | string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    assignments?: CodeAssignmentUncheckedCreateNestedManyWithoutCodeInput
  }

  export type CodeCreateOrConnectWithoutProductInput = {
    where: CodeWhereUniqueInput
    create: XOR<CodeCreateWithoutProductInput, CodeUncheckedCreateWithoutProductInput>
  }

  export type CodeCreateManyProductInputEnvelope = {
    data: CodeCreateManyProductInput | CodeCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type OrderItemCreateWithoutProductInput = {
    id?: string
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutOrderItemsInput
    codeAssignment?: CodeAssignmentCreateNestedOneWithoutOrderItemInput
    fulfillmentJobs?: FulfillmentJobCreateNestedManyWithoutOrderItemInput
    emailLogs?: EmailLogCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemUncheckedCreateWithoutProductInput = {
    id?: string
    orderId: string
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    codeAssignment?: CodeAssignmentUncheckedCreateNestedOneWithoutOrderItemInput
    fulfillmentJobs?: FulfillmentJobUncheckedCreateNestedManyWithoutOrderItemInput
    emailLogs?: EmailLogUncheckedCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemCreateOrConnectWithoutProductInput = {
    where: OrderItemWhereUniqueInput
    create: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput>
  }

  export type OrderItemCreateManyProductInputEnvelope = {
    data: OrderItemCreateManyProductInput | OrderItemCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type InventoryAlertStateCreateWithoutProductInput = {
    id?: string
    lowStockAlertSent?: boolean
    outOfStockAlertSent?: boolean
    lastKnownAvailableCount?: number
    updatedAt?: Date | string
  }

  export type InventoryAlertStateUncheckedCreateWithoutProductInput = {
    id?: string
    lowStockAlertSent?: boolean
    outOfStockAlertSent?: boolean
    lastKnownAvailableCount?: number
    updatedAt?: Date | string
  }

  export type InventoryAlertStateCreateOrConnectWithoutProductInput = {
    where: InventoryAlertStateWhereUniqueInput
    create: XOR<InventoryAlertStateCreateWithoutProductInput, InventoryAlertStateUncheckedCreateWithoutProductInput>
  }

  export type MailTemplateCreateWithoutProductsInput = {
    id?: string
    name: string
    subject: string
    bodyHtml: string
    bodyText: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MailTemplateUncheckedCreateWithoutProductsInput = {
    id?: string
    name: string
    subject: string
    bodyHtml: string
    bodyText: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MailTemplateCreateOrConnectWithoutProductsInput = {
    where: MailTemplateWhereUniqueInput
    create: XOR<MailTemplateCreateWithoutProductsInput, MailTemplateUncheckedCreateWithoutProductsInput>
  }

  export type CodeUpsertWithWhereUniqueWithoutProductInput = {
    where: CodeWhereUniqueInput
    update: XOR<CodeUpdateWithoutProductInput, CodeUncheckedUpdateWithoutProductInput>
    create: XOR<CodeCreateWithoutProductInput, CodeUncheckedCreateWithoutProductInput>
  }

  export type CodeUpdateWithWhereUniqueWithoutProductInput = {
    where: CodeWhereUniqueInput
    data: XOR<CodeUpdateWithoutProductInput, CodeUncheckedUpdateWithoutProductInput>
  }

  export type CodeUpdateManyWithWhereWithoutProductInput = {
    where: CodeScalarWhereInput
    data: XOR<CodeUpdateManyMutationInput, CodeUncheckedUpdateManyWithoutProductInput>
  }

  export type CodeScalarWhereInput = {
    AND?: CodeScalarWhereInput | CodeScalarWhereInput[]
    OR?: CodeScalarWhereInput[]
    NOT?: CodeScalarWhereInput | CodeScalarWhereInput[]
    id?: UuidFilter<"Code"> | string
    productId?: UuidFilter<"Code"> | string
    codeValue?: StringFilter<"Code"> | string
    sequenceNo?: IntFilter<"Code"> | number
    status?: EnumCodeStatusFilter<"Code"> | $Enums.CodeStatus
    reservedAt?: DateTimeNullableFilter<"Code"> | Date | string | null
    sentAt?: DateTimeNullableFilter<"Code"> | Date | string | null
    createdAt?: DateTimeFilter<"Code"> | Date | string
  }

  export type OrderItemUpsertWithWhereUniqueWithoutProductInput = {
    where: OrderItemWhereUniqueInput
    update: XOR<OrderItemUpdateWithoutProductInput, OrderItemUncheckedUpdateWithoutProductInput>
    create: XOR<OrderItemCreateWithoutProductInput, OrderItemUncheckedCreateWithoutProductInput>
  }

  export type OrderItemUpdateWithWhereUniqueWithoutProductInput = {
    where: OrderItemWhereUniqueInput
    data: XOR<OrderItemUpdateWithoutProductInput, OrderItemUncheckedUpdateWithoutProductInput>
  }

  export type OrderItemUpdateManyWithWhereWithoutProductInput = {
    where: OrderItemScalarWhereInput
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyWithoutProductInput>
  }

  export type OrderItemScalarWhereInput = {
    AND?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
    OR?: OrderItemScalarWhereInput[]
    NOT?: OrderItemScalarWhereInput | OrderItemScalarWhereInput[]
    id?: UuidFilter<"OrderItem"> | string
    orderId?: UuidFilter<"OrderItem"> | string
    productId?: UuidNullableFilter<"OrderItem"> | string | null
    productOrderId?: StringFilter<"OrderItem"> | string
    productName?: StringFilter<"OrderItem"> | string
    quantity?: IntFilter<"OrderItem"> | number
    buyerEmail?: StringNullableFilter<"OrderItem"> | string | null
    unitPrice?: IntFilter<"OrderItem"> | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFilter<"OrderItem"> | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: StringNullableFilter<"OrderItem"> | string | null
    failureReasonDetail?: StringNullableFilter<"OrderItem"> | string | null
    paidAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
    processedAt?: DateTimeNullableFilter<"OrderItem"> | Date | string | null
    createdAt?: DateTimeFilter<"OrderItem"> | Date | string
    updatedAt?: DateTimeFilter<"OrderItem"> | Date | string
  }

  export type InventoryAlertStateUpsertWithoutProductInput = {
    update: XOR<InventoryAlertStateUpdateWithoutProductInput, InventoryAlertStateUncheckedUpdateWithoutProductInput>
    create: XOR<InventoryAlertStateCreateWithoutProductInput, InventoryAlertStateUncheckedCreateWithoutProductInput>
    where?: InventoryAlertStateWhereInput
  }

  export type InventoryAlertStateUpdateToOneWithWhereWithoutProductInput = {
    where?: InventoryAlertStateWhereInput
    data: XOR<InventoryAlertStateUpdateWithoutProductInput, InventoryAlertStateUncheckedUpdateWithoutProductInput>
  }

  export type InventoryAlertStateUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    lowStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    outOfStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    lastKnownAvailableCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryAlertStateUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    lowStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    outOfStockAlertSent?: BoolFieldUpdateOperationsInput | boolean
    lastKnownAvailableCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MailTemplateUpsertWithoutProductsInput = {
    update: XOR<MailTemplateUpdateWithoutProductsInput, MailTemplateUncheckedUpdateWithoutProductsInput>
    create: XOR<MailTemplateCreateWithoutProductsInput, MailTemplateUncheckedCreateWithoutProductsInput>
    where?: MailTemplateWhereInput
  }

  export type MailTemplateUpdateToOneWithWhereWithoutProductsInput = {
    where?: MailTemplateWhereInput
    data: XOR<MailTemplateUpdateWithoutProductsInput, MailTemplateUncheckedUpdateWithoutProductsInput>
  }

  export type MailTemplateUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyHtml?: StringFieldUpdateOperationsInput | string
    bodyText?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MailTemplateUncheckedUpdateWithoutProductsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    subject?: StringFieldUpdateOperationsInput | string
    bodyHtml?: StringFieldUpdateOperationsInput | string
    bodyText?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateWithoutCodesInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemCreateNestedManyWithoutProductInput
    inventoryAlertState?: InventoryAlertStateCreateNestedOneWithoutProductInput
    mailTemplate?: MailTemplateCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateWithoutCodesInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    mailTemplateId?: string | null
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutProductInput
    inventoryAlertState?: InventoryAlertStateUncheckedCreateNestedOneWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutCodesInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutCodesInput, ProductUncheckedCreateWithoutCodesInput>
  }

  export type CodeAssignmentCreateWithoutCodeInput = {
    id?: string
    status?: $Enums.CodeAssignmentStatus
    assignedAt?: Date | string
    sentAt?: Date | string | null
    orderItem: OrderItemCreateNestedOneWithoutCodeAssignmentInput
  }

  export type CodeAssignmentUncheckedCreateWithoutCodeInput = {
    id?: string
    orderItemId: string
    status?: $Enums.CodeAssignmentStatus
    assignedAt?: Date | string
    sentAt?: Date | string | null
  }

  export type CodeAssignmentCreateOrConnectWithoutCodeInput = {
    where: CodeAssignmentWhereUniqueInput
    create: XOR<CodeAssignmentCreateWithoutCodeInput, CodeAssignmentUncheckedCreateWithoutCodeInput>
  }

  export type CodeAssignmentCreateManyCodeInputEnvelope = {
    data: CodeAssignmentCreateManyCodeInput | CodeAssignmentCreateManyCodeInput[]
    skipDuplicates?: boolean
  }

  export type ProductUpsertWithoutCodesInput = {
    update: XOR<ProductUpdateWithoutCodesInput, ProductUncheckedUpdateWithoutCodesInput>
    create: XOR<ProductCreateWithoutCodesInput, ProductUncheckedCreateWithoutCodesInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutCodesInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutCodesInput, ProductUncheckedUpdateWithoutCodesInput>
  }

  export type ProductUpdateWithoutCodesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUpdateManyWithoutProductNestedInput
    inventoryAlertState?: InventoryAlertStateUpdateOneWithoutProductNestedInput
    mailTemplate?: MailTemplateUpdateOneWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutCodesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    mailTemplateId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderItems?: OrderItemUncheckedUpdateManyWithoutProductNestedInput
    inventoryAlertState?: InventoryAlertStateUncheckedUpdateOneWithoutProductNestedInput
  }

  export type CodeAssignmentUpsertWithWhereUniqueWithoutCodeInput = {
    where: CodeAssignmentWhereUniqueInput
    update: XOR<CodeAssignmentUpdateWithoutCodeInput, CodeAssignmentUncheckedUpdateWithoutCodeInput>
    create: XOR<CodeAssignmentCreateWithoutCodeInput, CodeAssignmentUncheckedCreateWithoutCodeInput>
  }

  export type CodeAssignmentUpdateWithWhereUniqueWithoutCodeInput = {
    where: CodeAssignmentWhereUniqueInput
    data: XOR<CodeAssignmentUpdateWithoutCodeInput, CodeAssignmentUncheckedUpdateWithoutCodeInput>
  }

  export type CodeAssignmentUpdateManyWithWhereWithoutCodeInput = {
    where: CodeAssignmentScalarWhereInput
    data: XOR<CodeAssignmentUpdateManyMutationInput, CodeAssignmentUncheckedUpdateManyWithoutCodeInput>
  }

  export type CodeAssignmentScalarWhereInput = {
    AND?: CodeAssignmentScalarWhereInput | CodeAssignmentScalarWhereInput[]
    OR?: CodeAssignmentScalarWhereInput[]
    NOT?: CodeAssignmentScalarWhereInput | CodeAssignmentScalarWhereInput[]
    id?: UuidFilter<"CodeAssignment"> | string
    orderItemId?: UuidFilter<"CodeAssignment"> | string
    codeId?: UuidFilter<"CodeAssignment"> | string
    status?: EnumCodeAssignmentStatusFilter<"CodeAssignment"> | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFilter<"CodeAssignment"> | Date | string
    sentAt?: DateTimeNullableFilter<"CodeAssignment"> | Date | string | null
  }

  export type OrderItemCreateWithoutOrderInput = {
    id?: string
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    product?: ProductCreateNestedOneWithoutOrderItemsInput
    codeAssignment?: CodeAssignmentCreateNestedOneWithoutOrderItemInput
    fulfillmentJobs?: FulfillmentJobCreateNestedManyWithoutOrderItemInput
    emailLogs?: EmailLogCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemUncheckedCreateWithoutOrderInput = {
    id?: string
    productId?: string | null
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    codeAssignment?: CodeAssignmentUncheckedCreateNestedOneWithoutOrderItemInput
    fulfillmentJobs?: FulfillmentJobUncheckedCreateNestedManyWithoutOrderItemInput
    emailLogs?: EmailLogUncheckedCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemCreateOrConnectWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    create: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput>
  }

  export type OrderItemCreateManyOrderInputEnvelope = {
    data: OrderItemCreateManyOrderInput | OrderItemCreateManyOrderInput[]
    skipDuplicates?: boolean
  }

  export type OrderItemUpsertWithWhereUniqueWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    update: XOR<OrderItemUpdateWithoutOrderInput, OrderItemUncheckedUpdateWithoutOrderInput>
    create: XOR<OrderItemCreateWithoutOrderInput, OrderItemUncheckedCreateWithoutOrderInput>
  }

  export type OrderItemUpdateWithWhereUniqueWithoutOrderInput = {
    where: OrderItemWhereUniqueInput
    data: XOR<OrderItemUpdateWithoutOrderInput, OrderItemUncheckedUpdateWithoutOrderInput>
  }

  export type OrderItemUpdateManyWithWhereWithoutOrderInput = {
    where: OrderItemScalarWhereInput
    data: XOR<OrderItemUpdateManyMutationInput, OrderItemUncheckedUpdateManyWithoutOrderInput>
  }

  export type OrderCreateWithoutOrderItemsInput = {
    id?: string
    platform?: $Enums.Platform
    naverOrderId?: string | null
    ownOrderId?: string | null
    orderStatus: string
    ordererName?: string | null
    paidAt?: Date | string | null
    totalAmount?: number
    rawPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderUncheckedCreateWithoutOrderItemsInput = {
    id?: string
    platform?: $Enums.Platform
    naverOrderId?: string | null
    ownOrderId?: string | null
    orderStatus: string
    ordererName?: string | null
    paidAt?: Date | string | null
    totalAmount?: number
    rawPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderCreateOrConnectWithoutOrderItemsInput = {
    where: OrderWhereUniqueInput
    create: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
  }

  export type ProductCreateWithoutOrderItemsInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    codes?: CodeCreateNestedManyWithoutProductInput
    inventoryAlertState?: InventoryAlertStateCreateNestedOneWithoutProductInput
    mailTemplate?: MailTemplateCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateWithoutOrderItemsInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    mailTemplateId?: string | null
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    codes?: CodeUncheckedCreateNestedManyWithoutProductInput
    inventoryAlertState?: InventoryAlertStateUncheckedCreateNestedOneWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutOrderItemsInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutOrderItemsInput, ProductUncheckedCreateWithoutOrderItemsInput>
  }

  export type CodeAssignmentCreateWithoutOrderItemInput = {
    id?: string
    status?: $Enums.CodeAssignmentStatus
    assignedAt?: Date | string
    sentAt?: Date | string | null
    code: CodeCreateNestedOneWithoutAssignmentsInput
  }

  export type CodeAssignmentUncheckedCreateWithoutOrderItemInput = {
    id?: string
    codeId: string
    status?: $Enums.CodeAssignmentStatus
    assignedAt?: Date | string
    sentAt?: Date | string | null
  }

  export type CodeAssignmentCreateOrConnectWithoutOrderItemInput = {
    where: CodeAssignmentWhereUniqueInput
    create: XOR<CodeAssignmentCreateWithoutOrderItemInput, CodeAssignmentUncheckedCreateWithoutOrderItemInput>
  }

  export type FulfillmentJobCreateWithoutOrderItemInput = {
    id?: string
    jobType: string
    status?: $Enums.FulfillmentJobStatus
    retryCount?: number
    errorMessage?: string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type FulfillmentJobUncheckedCreateWithoutOrderItemInput = {
    id?: string
    jobType: string
    status?: $Enums.FulfillmentJobStatus
    retryCount?: number
    errorMessage?: string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type FulfillmentJobCreateOrConnectWithoutOrderItemInput = {
    where: FulfillmentJobWhereUniqueInput
    create: XOR<FulfillmentJobCreateWithoutOrderItemInput, FulfillmentJobUncheckedCreateWithoutOrderItemInput>
  }

  export type FulfillmentJobCreateManyOrderItemInputEnvelope = {
    data: FulfillmentJobCreateManyOrderItemInput | FulfillmentJobCreateManyOrderItemInput[]
    skipDuplicates?: boolean
  }

  export type EmailLogCreateWithoutOrderItemInput = {
    id?: string
    recipientEmail: string
    provider: string
    providerMessageId?: string | null
    templateName: string
    status?: $Enums.EmailLogStatus
    errorMessage?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type EmailLogUncheckedCreateWithoutOrderItemInput = {
    id?: string
    recipientEmail: string
    provider: string
    providerMessageId?: string | null
    templateName: string
    status?: $Enums.EmailLogStatus
    errorMessage?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type EmailLogCreateOrConnectWithoutOrderItemInput = {
    where: EmailLogWhereUniqueInput
    create: XOR<EmailLogCreateWithoutOrderItemInput, EmailLogUncheckedCreateWithoutOrderItemInput>
  }

  export type EmailLogCreateManyOrderItemInputEnvelope = {
    data: EmailLogCreateManyOrderItemInput | EmailLogCreateManyOrderItemInput[]
    skipDuplicates?: boolean
  }

  export type OrderUpsertWithoutOrderItemsInput = {
    update: XOR<OrderUpdateWithoutOrderItemsInput, OrderUncheckedUpdateWithoutOrderItemsInput>
    create: XOR<OrderCreateWithoutOrderItemsInput, OrderUncheckedCreateWithoutOrderItemsInput>
    where?: OrderWhereInput
  }

  export type OrderUpdateToOneWithWhereWithoutOrderItemsInput = {
    where?: OrderWhereInput
    data: XOR<OrderUpdateWithoutOrderItemsInput, OrderUncheckedUpdateWithoutOrderItemsInput>
  }

  export type OrderUpdateWithoutOrderItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    naverOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    ownOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    orderStatus?: StringFieldUpdateOperationsInput | string
    ordererName?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalAmount?: IntFieldUpdateOperationsInput | number
    rawPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderUncheckedUpdateWithoutOrderItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    platform?: EnumPlatformFieldUpdateOperationsInput | $Enums.Platform
    naverOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    ownOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    orderStatus?: StringFieldUpdateOperationsInput | string
    ordererName?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalAmount?: IntFieldUpdateOperationsInput | number
    rawPayload?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUpsertWithoutOrderItemsInput = {
    update: XOR<ProductUpdateWithoutOrderItemsInput, ProductUncheckedUpdateWithoutOrderItemsInput>
    create: XOR<ProductCreateWithoutOrderItemsInput, ProductUncheckedCreateWithoutOrderItemsInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutOrderItemsInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutOrderItemsInput, ProductUncheckedUpdateWithoutOrderItemsInput>
  }

  export type ProductUpdateWithoutOrderItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codes?: CodeUpdateManyWithoutProductNestedInput
    inventoryAlertState?: InventoryAlertStateUpdateOneWithoutProductNestedInput
    mailTemplate?: MailTemplateUpdateOneWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutOrderItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    mailTemplateId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codes?: CodeUncheckedUpdateManyWithoutProductNestedInput
    inventoryAlertState?: InventoryAlertStateUncheckedUpdateOneWithoutProductNestedInput
  }

  export type CodeAssignmentUpsertWithoutOrderItemInput = {
    update: XOR<CodeAssignmentUpdateWithoutOrderItemInput, CodeAssignmentUncheckedUpdateWithoutOrderItemInput>
    create: XOR<CodeAssignmentCreateWithoutOrderItemInput, CodeAssignmentUncheckedCreateWithoutOrderItemInput>
    where?: CodeAssignmentWhereInput
  }

  export type CodeAssignmentUpdateToOneWithWhereWithoutOrderItemInput = {
    where?: CodeAssignmentWhereInput
    data: XOR<CodeAssignmentUpdateWithoutOrderItemInput, CodeAssignmentUncheckedUpdateWithoutOrderItemInput>
  }

  export type CodeAssignmentUpdateWithoutOrderItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCodeAssignmentStatusFieldUpdateOperationsInput | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    code?: CodeUpdateOneRequiredWithoutAssignmentsNestedInput
  }

  export type CodeAssignmentUncheckedUpdateWithoutOrderItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    codeId?: StringFieldUpdateOperationsInput | string
    status?: EnumCodeAssignmentStatusFieldUpdateOperationsInput | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type FulfillmentJobUpsertWithWhereUniqueWithoutOrderItemInput = {
    where: FulfillmentJobWhereUniqueInput
    update: XOR<FulfillmentJobUpdateWithoutOrderItemInput, FulfillmentJobUncheckedUpdateWithoutOrderItemInput>
    create: XOR<FulfillmentJobCreateWithoutOrderItemInput, FulfillmentJobUncheckedCreateWithoutOrderItemInput>
  }

  export type FulfillmentJobUpdateWithWhereUniqueWithoutOrderItemInput = {
    where: FulfillmentJobWhereUniqueInput
    data: XOR<FulfillmentJobUpdateWithoutOrderItemInput, FulfillmentJobUncheckedUpdateWithoutOrderItemInput>
  }

  export type FulfillmentJobUpdateManyWithWhereWithoutOrderItemInput = {
    where: FulfillmentJobScalarWhereInput
    data: XOR<FulfillmentJobUpdateManyMutationInput, FulfillmentJobUncheckedUpdateManyWithoutOrderItemInput>
  }

  export type FulfillmentJobScalarWhereInput = {
    AND?: FulfillmentJobScalarWhereInput | FulfillmentJobScalarWhereInput[]
    OR?: FulfillmentJobScalarWhereInput[]
    NOT?: FulfillmentJobScalarWhereInput | FulfillmentJobScalarWhereInput[]
    id?: UuidFilter<"FulfillmentJob"> | string
    orderItemId?: UuidFilter<"FulfillmentJob"> | string
    jobType?: StringFilter<"FulfillmentJob"> | string
    status?: EnumFulfillmentJobStatusFilter<"FulfillmentJob"> | $Enums.FulfillmentJobStatus
    retryCount?: IntFilter<"FulfillmentJob"> | number
    errorMessage?: StringNullableFilter<"FulfillmentJob"> | string | null
    context?: JsonNullableFilter<"FulfillmentJob">
    processedAt?: DateTimeNullableFilter<"FulfillmentJob"> | Date | string | null
    createdAt?: DateTimeFilter<"FulfillmentJob"> | Date | string
  }

  export type EmailLogUpsertWithWhereUniqueWithoutOrderItemInput = {
    where: EmailLogWhereUniqueInput
    update: XOR<EmailLogUpdateWithoutOrderItemInput, EmailLogUncheckedUpdateWithoutOrderItemInput>
    create: XOR<EmailLogCreateWithoutOrderItemInput, EmailLogUncheckedCreateWithoutOrderItemInput>
  }

  export type EmailLogUpdateWithWhereUniqueWithoutOrderItemInput = {
    where: EmailLogWhereUniqueInput
    data: XOR<EmailLogUpdateWithoutOrderItemInput, EmailLogUncheckedUpdateWithoutOrderItemInput>
  }

  export type EmailLogUpdateManyWithWhereWithoutOrderItemInput = {
    where: EmailLogScalarWhereInput
    data: XOR<EmailLogUpdateManyMutationInput, EmailLogUncheckedUpdateManyWithoutOrderItemInput>
  }

  export type EmailLogScalarWhereInput = {
    AND?: EmailLogScalarWhereInput | EmailLogScalarWhereInput[]
    OR?: EmailLogScalarWhereInput[]
    NOT?: EmailLogScalarWhereInput | EmailLogScalarWhereInput[]
    id?: UuidFilter<"EmailLog"> | string
    orderItemId?: UuidFilter<"EmailLog"> | string
    recipientEmail?: StringFilter<"EmailLog"> | string
    provider?: StringFilter<"EmailLog"> | string
    providerMessageId?: StringNullableFilter<"EmailLog"> | string | null
    templateName?: StringFilter<"EmailLog"> | string
    status?: EnumEmailLogStatusFilter<"EmailLog"> | $Enums.EmailLogStatus
    errorMessage?: StringNullableFilter<"EmailLog"> | string | null
    sentAt?: DateTimeNullableFilter<"EmailLog"> | Date | string | null
    createdAt?: DateTimeFilter<"EmailLog"> | Date | string
  }

  export type OrderItemCreateWithoutCodeAssignmentInput = {
    id?: string
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutOrderItemsInput
    product?: ProductCreateNestedOneWithoutOrderItemsInput
    fulfillmentJobs?: FulfillmentJobCreateNestedManyWithoutOrderItemInput
    emailLogs?: EmailLogCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemUncheckedCreateWithoutCodeAssignmentInput = {
    id?: string
    orderId: string
    productId?: string | null
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    fulfillmentJobs?: FulfillmentJobUncheckedCreateNestedManyWithoutOrderItemInput
    emailLogs?: EmailLogUncheckedCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemCreateOrConnectWithoutCodeAssignmentInput = {
    where: OrderItemWhereUniqueInput
    create: XOR<OrderItemCreateWithoutCodeAssignmentInput, OrderItemUncheckedCreateWithoutCodeAssignmentInput>
  }

  export type CodeCreateWithoutAssignmentsInput = {
    id?: string
    codeValue: string
    sequenceNo: number
    status?: $Enums.CodeStatus
    reservedAt?: Date | string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
    product: ProductCreateNestedOneWithoutCodesInput
  }

  export type CodeUncheckedCreateWithoutAssignmentsInput = {
    id?: string
    productId: string
    codeValue: string
    sequenceNo: number
    status?: $Enums.CodeStatus
    reservedAt?: Date | string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type CodeCreateOrConnectWithoutAssignmentsInput = {
    where: CodeWhereUniqueInput
    create: XOR<CodeCreateWithoutAssignmentsInput, CodeUncheckedCreateWithoutAssignmentsInput>
  }

  export type OrderItemUpsertWithoutCodeAssignmentInput = {
    update: XOR<OrderItemUpdateWithoutCodeAssignmentInput, OrderItemUncheckedUpdateWithoutCodeAssignmentInput>
    create: XOR<OrderItemCreateWithoutCodeAssignmentInput, OrderItemUncheckedCreateWithoutCodeAssignmentInput>
    where?: OrderItemWhereInput
  }

  export type OrderItemUpdateToOneWithWhereWithoutCodeAssignmentInput = {
    where?: OrderItemWhereInput
    data: XOR<OrderItemUpdateWithoutCodeAssignmentInput, OrderItemUncheckedUpdateWithoutCodeAssignmentInput>
  }

  export type OrderItemUpdateWithoutCodeAssignmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutOrderItemsNestedInput
    product?: ProductUpdateOneWithoutOrderItemsNestedInput
    fulfillmentJobs?: FulfillmentJobUpdateManyWithoutOrderItemNestedInput
    emailLogs?: EmailLogUpdateManyWithoutOrderItemNestedInput
  }

  export type OrderItemUncheckedUpdateWithoutCodeAssignmentInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fulfillmentJobs?: FulfillmentJobUncheckedUpdateManyWithoutOrderItemNestedInput
    emailLogs?: EmailLogUncheckedUpdateManyWithoutOrderItemNestedInput
  }

  export type CodeUpsertWithoutAssignmentsInput = {
    update: XOR<CodeUpdateWithoutAssignmentsInput, CodeUncheckedUpdateWithoutAssignmentsInput>
    create: XOR<CodeCreateWithoutAssignmentsInput, CodeUncheckedCreateWithoutAssignmentsInput>
    where?: CodeWhereInput
  }

  export type CodeUpdateToOneWithWhereWithoutAssignmentsInput = {
    where?: CodeWhereInput
    data: XOR<CodeUpdateWithoutAssignmentsInput, CodeUncheckedUpdateWithoutAssignmentsInput>
  }

  export type CodeUpdateWithoutAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    codeValue?: StringFieldUpdateOperationsInput | string
    sequenceNo?: IntFieldUpdateOperationsInput | number
    status?: EnumCodeStatusFieldUpdateOperationsInput | $Enums.CodeStatus
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: ProductUpdateOneRequiredWithoutCodesNestedInput
  }

  export type CodeUncheckedUpdateWithoutAssignmentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: StringFieldUpdateOperationsInput | string
    codeValue?: StringFieldUpdateOperationsInput | string
    sequenceNo?: IntFieldUpdateOperationsInput | number
    status?: EnumCodeStatusFieldUpdateOperationsInput | $Enums.CodeStatus
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderItemCreateWithoutFulfillmentJobsInput = {
    id?: string
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutOrderItemsInput
    product?: ProductCreateNestedOneWithoutOrderItemsInput
    codeAssignment?: CodeAssignmentCreateNestedOneWithoutOrderItemInput
    emailLogs?: EmailLogCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemUncheckedCreateWithoutFulfillmentJobsInput = {
    id?: string
    orderId: string
    productId?: string | null
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    codeAssignment?: CodeAssignmentUncheckedCreateNestedOneWithoutOrderItemInput
    emailLogs?: EmailLogUncheckedCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemCreateOrConnectWithoutFulfillmentJobsInput = {
    where: OrderItemWhereUniqueInput
    create: XOR<OrderItemCreateWithoutFulfillmentJobsInput, OrderItemUncheckedCreateWithoutFulfillmentJobsInput>
  }

  export type OrderItemUpsertWithoutFulfillmentJobsInput = {
    update: XOR<OrderItemUpdateWithoutFulfillmentJobsInput, OrderItemUncheckedUpdateWithoutFulfillmentJobsInput>
    create: XOR<OrderItemCreateWithoutFulfillmentJobsInput, OrderItemUncheckedCreateWithoutFulfillmentJobsInput>
    where?: OrderItemWhereInput
  }

  export type OrderItemUpdateToOneWithWhereWithoutFulfillmentJobsInput = {
    where?: OrderItemWhereInput
    data: XOR<OrderItemUpdateWithoutFulfillmentJobsInput, OrderItemUncheckedUpdateWithoutFulfillmentJobsInput>
  }

  export type OrderItemUpdateWithoutFulfillmentJobsInput = {
    id?: StringFieldUpdateOperationsInput | string
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutOrderItemsNestedInput
    product?: ProductUpdateOneWithoutOrderItemsNestedInput
    codeAssignment?: CodeAssignmentUpdateOneWithoutOrderItemNestedInput
    emailLogs?: EmailLogUpdateManyWithoutOrderItemNestedInput
  }

  export type OrderItemUncheckedUpdateWithoutFulfillmentJobsInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codeAssignment?: CodeAssignmentUncheckedUpdateOneWithoutOrderItemNestedInput
    emailLogs?: EmailLogUncheckedUpdateManyWithoutOrderItemNestedInput
  }

  export type OrderItemCreateWithoutEmailLogsInput = {
    id?: string
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    order: OrderCreateNestedOneWithoutOrderItemsInput
    product?: ProductCreateNestedOneWithoutOrderItemsInput
    codeAssignment?: CodeAssignmentCreateNestedOneWithoutOrderItemInput
    fulfillmentJobs?: FulfillmentJobCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemUncheckedCreateWithoutEmailLogsInput = {
    id?: string
    orderId: string
    productId?: string | null
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    codeAssignment?: CodeAssignmentUncheckedCreateNestedOneWithoutOrderItemInput
    fulfillmentJobs?: FulfillmentJobUncheckedCreateNestedManyWithoutOrderItemInput
  }

  export type OrderItemCreateOrConnectWithoutEmailLogsInput = {
    where: OrderItemWhereUniqueInput
    create: XOR<OrderItemCreateWithoutEmailLogsInput, OrderItemUncheckedCreateWithoutEmailLogsInput>
  }

  export type OrderItemUpsertWithoutEmailLogsInput = {
    update: XOR<OrderItemUpdateWithoutEmailLogsInput, OrderItemUncheckedUpdateWithoutEmailLogsInput>
    create: XOR<OrderItemCreateWithoutEmailLogsInput, OrderItemUncheckedCreateWithoutEmailLogsInput>
    where?: OrderItemWhereInput
  }

  export type OrderItemUpdateToOneWithWhereWithoutEmailLogsInput = {
    where?: OrderItemWhereInput
    data: XOR<OrderItemUpdateWithoutEmailLogsInput, OrderItemUncheckedUpdateWithoutEmailLogsInput>
  }

  export type OrderItemUpdateWithoutEmailLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutOrderItemsNestedInput
    product?: ProductUpdateOneWithoutOrderItemsNestedInput
    codeAssignment?: CodeAssignmentUpdateOneWithoutOrderItemNestedInput
    fulfillmentJobs?: FulfillmentJobUpdateManyWithoutOrderItemNestedInput
  }

  export type OrderItemUncheckedUpdateWithoutEmailLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codeAssignment?: CodeAssignmentUncheckedUpdateOneWithoutOrderItemNestedInput
    fulfillmentJobs?: FulfillmentJobUncheckedUpdateManyWithoutOrderItemNestedInput
  }

  export type ProductCreateWithoutMailTemplateInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    codes?: CodeCreateNestedManyWithoutProductInput
    orderItems?: OrderItemCreateNestedManyWithoutProductInput
    inventoryAlertState?: InventoryAlertStateCreateNestedOneWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutMailTemplateInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    codes?: CodeUncheckedCreateNestedManyWithoutProductInput
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutProductInput
    inventoryAlertState?: InventoryAlertStateUncheckedCreateNestedOneWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutMailTemplateInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutMailTemplateInput, ProductUncheckedCreateWithoutMailTemplateInput>
  }

  export type ProductCreateManyMailTemplateInputEnvelope = {
    data: ProductCreateManyMailTemplateInput | ProductCreateManyMailTemplateInput[]
    skipDuplicates?: boolean
  }

  export type ProductUpsertWithWhereUniqueWithoutMailTemplateInput = {
    where: ProductWhereUniqueInput
    update: XOR<ProductUpdateWithoutMailTemplateInput, ProductUncheckedUpdateWithoutMailTemplateInput>
    create: XOR<ProductCreateWithoutMailTemplateInput, ProductUncheckedCreateWithoutMailTemplateInput>
  }

  export type ProductUpdateWithWhereUniqueWithoutMailTemplateInput = {
    where: ProductWhereUniqueInput
    data: XOR<ProductUpdateWithoutMailTemplateInput, ProductUncheckedUpdateWithoutMailTemplateInput>
  }

  export type ProductUpdateManyWithWhereWithoutMailTemplateInput = {
    where: ProductScalarWhereInput
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyWithoutMailTemplateInput>
  }

  export type ProductScalarWhereInput = {
    AND?: ProductScalarWhereInput | ProductScalarWhereInput[]
    OR?: ProductScalarWhereInput[]
    NOT?: ProductScalarWhereInput | ProductScalarWhereInput[]
    id?: UuidFilter<"Product"> | string
    name?: StringFilter<"Product"> | string
    description?: StringNullableFilter<"Product"> | string | null
    price?: IntFilter<"Product"> | number
    internalProductCode?: StringFilter<"Product"> | string
    naverProductId?: StringNullableFilter<"Product"> | string | null
    sellerManagementCode?: StringFilter<"Product"> | string
    emailOptionName?: StringFilter<"Product"> | string
    mailTemplateId?: UuidNullableFilter<"Product"> | string | null
    status?: EnumProductStatusFilter<"Product"> | $Enums.ProductStatus
    createdAt?: DateTimeFilter<"Product"> | Date | string
    updatedAt?: DateTimeFilter<"Product"> | Date | string
  }

  export type ProductCreateWithoutInventoryAlertStateInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    codes?: CodeCreateNestedManyWithoutProductInput
    orderItems?: OrderItemCreateNestedManyWithoutProductInput
    mailTemplate?: MailTemplateCreateNestedOneWithoutProductsInput
  }

  export type ProductUncheckedCreateWithoutInventoryAlertStateInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    mailTemplateId?: string | null
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
    codes?: CodeUncheckedCreateNestedManyWithoutProductInput
    orderItems?: OrderItemUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutInventoryAlertStateInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutInventoryAlertStateInput, ProductUncheckedCreateWithoutInventoryAlertStateInput>
  }

  export type ProductUpsertWithoutInventoryAlertStateInput = {
    update: XOR<ProductUpdateWithoutInventoryAlertStateInput, ProductUncheckedUpdateWithoutInventoryAlertStateInput>
    create: XOR<ProductCreateWithoutInventoryAlertStateInput, ProductUncheckedCreateWithoutInventoryAlertStateInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutInventoryAlertStateInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutInventoryAlertStateInput, ProductUncheckedUpdateWithoutInventoryAlertStateInput>
  }

  export type ProductUpdateWithoutInventoryAlertStateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codes?: CodeUpdateManyWithoutProductNestedInput
    orderItems?: OrderItemUpdateManyWithoutProductNestedInput
    mailTemplate?: MailTemplateUpdateOneWithoutProductsNestedInput
  }

  export type ProductUncheckedUpdateWithoutInventoryAlertStateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    mailTemplateId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codes?: CodeUncheckedUpdateManyWithoutProductNestedInput
    orderItems?: OrderItemUncheckedUpdateManyWithoutProductNestedInput
  }

  export type CodeCreateManyProductInput = {
    id?: string
    codeValue: string
    sequenceNo: number
    status?: $Enums.CodeStatus
    reservedAt?: Date | string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type OrderItemCreateManyProductInput = {
    id?: string
    orderId: string
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CodeUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    codeValue?: StringFieldUpdateOperationsInput | string
    sequenceNo?: IntFieldUpdateOperationsInput | number
    status?: EnumCodeStatusFieldUpdateOperationsInput | $Enums.CodeStatus
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignments?: CodeAssignmentUpdateManyWithoutCodeNestedInput
  }

  export type CodeUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    codeValue?: StringFieldUpdateOperationsInput | string
    sequenceNo?: IntFieldUpdateOperationsInput | number
    status?: EnumCodeStatusFieldUpdateOperationsInput | $Enums.CodeStatus
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    assignments?: CodeAssignmentUncheckedUpdateManyWithoutCodeNestedInput
  }

  export type CodeUncheckedUpdateManyWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    codeValue?: StringFieldUpdateOperationsInput | string
    sequenceNo?: IntFieldUpdateOperationsInput | number
    status?: EnumCodeStatusFieldUpdateOperationsInput | $Enums.CodeStatus
    reservedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderItemUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    order?: OrderUpdateOneRequiredWithoutOrderItemsNestedInput
    codeAssignment?: CodeAssignmentUpdateOneWithoutOrderItemNestedInput
    fulfillmentJobs?: FulfillmentJobUpdateManyWithoutOrderItemNestedInput
    emailLogs?: EmailLogUpdateManyWithoutOrderItemNestedInput
  }

  export type OrderItemUncheckedUpdateWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codeAssignment?: CodeAssignmentUncheckedUpdateOneWithoutOrderItemNestedInput
    fulfillmentJobs?: FulfillmentJobUncheckedUpdateManyWithoutOrderItemNestedInput
    emailLogs?: EmailLogUncheckedUpdateManyWithoutOrderItemNestedInput
  }

  export type OrderItemUncheckedUpdateManyWithoutProductInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderId?: StringFieldUpdateOperationsInput | string
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CodeAssignmentCreateManyCodeInput = {
    id?: string
    orderItemId: string
    status?: $Enums.CodeAssignmentStatus
    assignedAt?: Date | string
    sentAt?: Date | string | null
  }

  export type CodeAssignmentUpdateWithoutCodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: EnumCodeAssignmentStatusFieldUpdateOperationsInput | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    orderItem?: OrderItemUpdateOneRequiredWithoutCodeAssignmentNestedInput
  }

  export type CodeAssignmentUncheckedUpdateWithoutCodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    status?: EnumCodeAssignmentStatusFieldUpdateOperationsInput | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type CodeAssignmentUncheckedUpdateManyWithoutCodeInput = {
    id?: StringFieldUpdateOperationsInput | string
    orderItemId?: StringFieldUpdateOperationsInput | string
    status?: EnumCodeAssignmentStatusFieldUpdateOperationsInput | $Enums.CodeAssignmentStatus
    assignedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type OrderItemCreateManyOrderInput = {
    id?: string
    productId?: string | null
    productOrderId: string
    productName: string
    quantity?: number
    buyerEmail?: string | null
    unitPrice?: number
    fulfillmentStatus?: $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: string | null
    failureReasonDetail?: string | null
    paidAt?: Date | string | null
    processedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderItemUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: ProductUpdateOneWithoutOrderItemsNestedInput
    codeAssignment?: CodeAssignmentUpdateOneWithoutOrderItemNestedInput
    fulfillmentJobs?: FulfillmentJobUpdateManyWithoutOrderItemNestedInput
    emailLogs?: EmailLogUpdateManyWithoutOrderItemNestedInput
  }

  export type OrderItemUncheckedUpdateWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codeAssignment?: CodeAssignmentUncheckedUpdateOneWithoutOrderItemNestedInput
    fulfillmentJobs?: FulfillmentJobUncheckedUpdateManyWithoutOrderItemNestedInput
    emailLogs?: EmailLogUncheckedUpdateManyWithoutOrderItemNestedInput
  }

  export type OrderItemUncheckedUpdateManyWithoutOrderInput = {
    id?: StringFieldUpdateOperationsInput | string
    productId?: NullableStringFieldUpdateOperationsInput | string | null
    productOrderId?: StringFieldUpdateOperationsInput | string
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    buyerEmail?: NullableStringFieldUpdateOperationsInput | string | null
    unitPrice?: IntFieldUpdateOperationsInput | number
    fulfillmentStatus?: EnumOrderItemFulfillmentStatusFieldUpdateOperationsInput | $Enums.OrderItemFulfillmentStatus
    failureReasonCode?: NullableStringFieldUpdateOperationsInput | string | null
    failureReasonDetail?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FulfillmentJobCreateManyOrderItemInput = {
    id?: string
    jobType: string
    status?: $Enums.FulfillmentJobStatus
    retryCount?: number
    errorMessage?: string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: Date | string | null
    createdAt?: Date | string
  }

  export type EmailLogCreateManyOrderItemInput = {
    id?: string
    recipientEmail: string
    provider: string
    providerMessageId?: string | null
    templateName: string
    status?: $Enums.EmailLogStatus
    errorMessage?: string | null
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type FulfillmentJobUpdateWithoutOrderItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    status?: EnumFulfillmentJobStatusFieldUpdateOperationsInput | $Enums.FulfillmentJobStatus
    retryCount?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FulfillmentJobUncheckedUpdateWithoutOrderItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    status?: EnumFulfillmentJobStatusFieldUpdateOperationsInput | $Enums.FulfillmentJobStatus
    retryCount?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type FulfillmentJobUncheckedUpdateManyWithoutOrderItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    status?: EnumFulfillmentJobStatusFieldUpdateOperationsInput | $Enums.FulfillmentJobStatus
    retryCount?: IntFieldUpdateOperationsInput | number
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    context?: NullableJsonNullValueInput | InputJsonValue
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailLogUpdateWithoutOrderItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    recipientEmail?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    templateName?: StringFieldUpdateOperationsInput | string
    status?: EnumEmailLogStatusFieldUpdateOperationsInput | $Enums.EmailLogStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailLogUncheckedUpdateWithoutOrderItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    recipientEmail?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    templateName?: StringFieldUpdateOperationsInput | string
    status?: EnumEmailLogStatusFieldUpdateOperationsInput | $Enums.EmailLogStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmailLogUncheckedUpdateManyWithoutOrderItemInput = {
    id?: StringFieldUpdateOperationsInput | string
    recipientEmail?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    providerMessageId?: NullableStringFieldUpdateOperationsInput | string | null
    templateName?: StringFieldUpdateOperationsInput | string
    status?: EnumEmailLogStatusFieldUpdateOperationsInput | $Enums.EmailLogStatus
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductCreateManyMailTemplateInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    internalProductCode: string
    naverProductId?: string | null
    sellerManagementCode: string
    emailOptionName: string
    status?: $Enums.ProductStatus
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProductUpdateWithoutMailTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codes?: CodeUpdateManyWithoutProductNestedInput
    orderItems?: OrderItemUpdateManyWithoutProductNestedInput
    inventoryAlertState?: InventoryAlertStateUpdateOneWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutMailTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    codes?: CodeUncheckedUpdateManyWithoutProductNestedInput
    orderItems?: OrderItemUncheckedUpdateManyWithoutProductNestedInput
    inventoryAlertState?: InventoryAlertStateUncheckedUpdateOneWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateManyWithoutMailTemplateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: IntFieldUpdateOperationsInput | number
    internalProductCode?: StringFieldUpdateOperationsInput | string
    naverProductId?: NullableStringFieldUpdateOperationsInput | string | null
    sellerManagementCode?: StringFieldUpdateOperationsInput | string
    emailOptionName?: StringFieldUpdateOperationsInput | string
    status?: EnumProductStatusFieldUpdateOperationsInput | $Enums.ProductStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}