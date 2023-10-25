import { InterpretedCall } from './typing';

export const MOCK_TRACE_WITH_MOVE_SEMANTICS: InterpretedCall = {
  expression: {
    expr: 'invariant',
    semantic: 'move data',
    inputs: [
      {
        kind: 'remote',
        path: [],
        index: 2,
        snapshot: {
          kind: 'remote_object',
          type: 'secretflow.device.device.pyu.PYUObject',
          id: 'secretflow/PYU/ray/ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
          location: ['PYU', 'bob'],
        },
      },
    ],
    destination: ['SPU', 'alice', 'bob'],
    outputs: [
      {
        kind: 'remote',
        path: [],
        index: 8,
        snapshot: {
          kind: 'remote_object',
          type: 'secretflow.device.device.spu.SPUObject',
          id: 'secretflow/SPU/ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000001000000)',
          location: ['SPU', 'alice', 'bob'],
        },
      },
    ],
  },
  span_id: '0xbf44e219812197ef',
  start_time: '2023-10-25T09:37:49.207295',
  end_time: '2023-10-25T09:37:49.369481',
  call: {
    checkpoint: { api_level: 20 },
    snapshot: {
      kind: 'function',
      type: 'builtins.function',
      id: 'python/id/0x17fd1d9d0',
      hash: 'python/hash/0x17fd1d9d',
      module: 'secretflow.device.kernels.pyu',
      name: 'pyu_to_spu',
      boundvars: {
        self: {
          kind: 'remote_object',
          type: 'secretflow.device.device.pyu.PYUObject',
          id: 'secretflow/PYU/ray/ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
          location: ['PYU', 'bob'],
        },
        spu: {
          kind: 'remote_location',
          type: 'secretflow.device.device.spu.SPU',
          id: 'python/id/0x29f3d8f70',
          location: ['SPU', 'alice', 'bob'],
        },
        spu_vis: {
          kind: 'object',
          type: 'builtins.str',
          id: 'python/id/0x104d52f30',
          hash: 'python/hash/0x4f4d46dc60fa0bc4',
          snapshot: "'secret'",
        },
      },
      freevars: {
        isinstance: {
          kind: 'object',
          type: 'builtins.builtin_function_or_method',
          id: 'python/id/0x100778b80',
          hash: 'python/hash/0x27a186',
          snapshot: '<built-in function isinstance>',
        },
        SPU: {
          kind: 'object',
          type: 'abc.ABCMeta',
          id: 'python/id/0x13e0f32b0',
          hash: 'python/hash/0x13e0f32b',
          snapshot: "<class 'secretflow.device.device.spu.SPU'>",
        },
        AssertionError: {
          kind: 'object',
          type: 'builtins.type',
          id: 'python/id/0x10269df60',
          hash: 'python/hash/0x10269df6',
          snapshot: "<class 'AssertionError'>",
        },
        type: {
          kind: 'object',
          type: 'builtins.type',
          id: 'python/id/0x1026e8698',
          hash: 'python/hash/-0x7fffffffefd91797',
          snapshot: "<class 'type'>",
        },
        Visibility: {
          kind: 'object',
          type: 'google.protobuf.internal.enum_type_wrapper.EnumTypeWrapper',
          id: 'python/id/0x17fa80250',
          hash: 'python/hash/0x17fa8025',
          snapshot:
            '<google.protobuf.internal.enum_type_wrapper.EnumTypeWrapper object at 0x17fa80250>',
        },
        int: {
          kind: 'object',
          type: 'builtins.type',
          id: 'python/id/0x1026e5160',
          hash: 'python/hash/0x1026e516',
          snapshot: "<class 'int'>",
        },
        sfd: {
          kind: 'object',
          type: 'builtins.module',
          id: 'python/id/0x17fb8a450',
          hash: 'python/hash/0x17fb8a45',
          snapshot:
            "<module 'secretflow.distributed' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/__init__.py'>",
        },
        SPUObject: {
          kind: 'object',
          type: 'abc.ABCMeta',
          id: 'python/id/0x13e0f1d80',
          hash: 'python/hash/0x13e0f1d8',
          snapshot: "<class 'secretflow.device.device.spu.SPUObject'>",
        },
      },
      retval: {
        kind: 'remote_object',
        type: 'secretflow.device.device.spu.SPUObject',
        id: 'secretflow/SPU/ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000001000000)',
        location: ['SPU', 'alice', 'bob'],
      },
      filename:
        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
      firstlineno: 48,
      source:
        "@register_to(DeviceType.PYU, DeviceType.SPU)\ndef pyu_to_spu(self: PYUObject, spu: SPU, spu_vis: str = 'secret') -> SPUObject:\n    \"\"\"Transfer pyuobject to the spu.\n\n    Args:\n        self: the pyuobject to transfer.\n        spu: to this SPU device.\n        spu_vis: optional; SPU object visibility. Value can be:\n            - secret: Secret sharing with protocol spdz-2k, aby3, etc.\n            - public: Public sharing, which means data will be replicated to each node.\n\n    Returns:\n        the transferred SPUObject.\n    \"\"\"\n    assert isinstance(spu, SPU), f'Expect an SPU but got {type(spu)}'\n    assert spu_vis in ('secret', 'public'), f'vis must be public or secret'\n\n    vtype = Visibility.VIS_PUBLIC if spu_vis == 'public' else Visibility.VIS_SECRET\n\n    def get_shares_chunk_count(data, runtime_config, world_size, vtype) -> int:\n        io = SPUIO(runtime_config, world_size)\n        return io.get_shares_chunk_count(data, vtype)\n\n    def run_spu_io(data, runtime_config, world_size, vtype):\n        io = SPUIO(runtime_config, world_size)\n        ret = io.make_shares(data, vtype)\n        return ret\n\n    shares_chunk_count = self.device(get_shares_chunk_count)(\n        self.data, spu.conf, spu.world_size, vtype\n    )\n    shares_chunk_count = sfd.get(shares_chunk_count.data)\n\n    meta, io_info, *shares_chunk = self.device(\n        run_spu_io, num_returns=(2 + shares_chunk_count * spu.world_size)\n    )(self.data, spu.conf, spu.world_size, vtype)\n\n    return SPUObject(\n        spu,\n        meta.data,\n        spu.infeed_shares(io_info.data, [s.data for s in shares_chunk]),\n    )\n",
      docstring:
        'Transfer pyuobject to the spu.\n\nArgs:\n    self: the pyuobject to transfer.\n    spu: to this SPU device.\n    spu_vis: optional; SPU object visibility. Value can be:\n        - secret: Secret sharing with protocol spdz-2k, aby3, etc.\n        - public: Public sharing, which means data will be replicated to each node.\n\nReturns:\n    the transferred SPUObject.',
    },
    stackframes: [
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
        lineno: 48,
        func: 'pyu_to_spu',
        code: '@register_to(DeviceType.PYU, DeviceType.SPU)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
        lineno: 80,
        func: 'dispatch',
        code: '        return self._ops[device_type][name](*args, **kwargs)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
        lineno: 111,
        func: 'dispatch',
        code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
        lineno: 68,
        func: 'to',
        code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
      },
      {
        filename: 'presets/millionaires/_algorithm.py',
        lineno: 29,
        func: '<module>',
        code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
      },
      {
        filename: 'Cell In[3]',
        lineno: 35,
        func: '<module>',
        code: '        exec(_algorithm, globals())\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3508,
        func: 'run_code',
        code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3448,
        func: 'run_ast_nodes',
        code: '                if await self.run_code(code, result, async_=asy):\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3269,
        func: 'run_cell_async',
        code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
        lineno: 129,
        func: '_pseudo_sync_runner',
        code: '        coro.send(None)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3064,
        func: '_run_cell',
        code: '            result = runner(coro)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3009,
        func: 'run_cell',
        code: '            result = self._run_cell(\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
        lineno: 546,
        func: 'run_cell',
        code: '        return super().run_cell(*args, **kwargs)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
        lineno: 422,
        func: 'do_execute',
        code: '                    res = shell.run_cell(\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 740,
        func: 'execute_request',
        code: '            reply_content = await reply_content\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 412,
        func: 'dispatch_shell',
        code: '                    await result\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 505,
        func: 'process_one',
        code: '        await dispatch(*args)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 516,
        func: 'dispatch_queue',
        code: '                await self.process_one()\n',
      },
      {
        filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
        lineno: 81,
        func: '_run',
        code: '            self._context.run(self._callback, *self._args)\n',
      },
      {
        filename:
          '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
        lineno: 1859,
        func: '_run_once',
        code: '                handle._run()\n',
      },
      {
        filename:
          '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
        lineno: 570,
        func: 'run_forever',
        code: '                self._run_once()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
        lineno: 195,
        func: 'start',
        code: '        self.asyncio_loop.run_forever()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
        lineno: 736,
        func: 'start',
        code: '                self.io_loop.start()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
        lineno: 1051,
        func: 'launch_instance',
        code: '        app.start()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
        lineno: 17,
        func: '<module>',
        code: '    app.launch_new_instance()\n',
      },
      {
        filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
        lineno: 87,
        func: '_run_code',
        code: '    exec(code, run_globals)\n',
      },
      {
        filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
        lineno: 194,
        func: '_run_module_as_main',
        code: '    return _run_code(code, main_globals, None,\n',
      },
    ],
  },
  inner_calls: [
    {
      span_id: '0x63420a3f752279e5',
      start_time: '2023-10-25T09:37:49.212990',
      end_time: '2023-10-25T09:37:49.215066',
      call: {
        checkpoint: { api_level: 10 },
        snapshot: {
          kind: 'function',
          type: 'builtins.function',
          id: 'python/id/0x17fcf70d0',
          hash: 'python/hash/0x17fcf70d',
          module: 'secretflow.device.device.pyu',
          name: 'PYU.__call__',
          boundvars: {
            self: {
              kind: 'remote_location',
              type: 'secretflow.device.device.pyu.PYU',
              id: 'python/id/0x335297d00',
              location: ['PYU', 'bob'],
            },
            fn: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x336ad9040',
              hash: 'python/hash/0x336ad904',
              module: 'secretflow.device.kernels.pyu',
              name: 'pyu_to_spu.<locals>.get_shares_chunk_count',
              boundvars: {
                data: { kind: 'unbound', annotation: 'typing.Any' },
                runtime_config: { kind: 'unbound', annotation: 'typing.Any' },
                world_size: { kind: 'unbound', annotation: 'typing.Any' },
                vtype: { kind: 'unbound', annotation: 'typing.Any' },
              },
              freevars: {
                SPUIO: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13e0f2130',
                  hash: 'python/hash/0x13e0f213',
                  snapshot: "<class 'secretflow.device.device.spu.SPUIO'>",
                },
              },
              retval: { kind: 'unbound', annotation: "<class 'int'>" },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
              firstlineno: 67,
              source:
                'def get_shares_chunk_count(data, runtime_config, world_size, vtype) -> int:\n    io = SPUIO(runtime_config, world_size)\n    return io.get_shares_chunk_count(data, vtype)\n',
            },
            num_returns: {
              kind: 'object',
              type: 'builtins.NoneType',
              id: 'python/id/0x1026e94f0',
              hash: 'python/hash/0x1026e94f',
              snapshot: 'None',
            },
            kwargs: {
              kind: 'mapping',
              type: 'builtins.dict',
              id: 'python/id/0x336bc25c0',
              snapshot: '{}',
              values: {},
            },
          },
          freevars: {},
          retval: {
            kind: 'function',
            type: 'builtins.function',
            id: 'python/id/0x336b93700',
            hash: 'python/hash/0x336b9370',
            module: 'secretflow.device.device.pyu',
            name: 'PYU.__call__.<locals>.wrapper',
            boundvars: {
              args: { kind: 'unbound', annotation: 'typing.Any' },
              kwargs: { kind: 'unbound', annotation: 'typing.Any' },
            },
            freevars: {
              fn: {
                kind: 'function',
                type: 'builtins.function',
                id: 'python/id/0x336ad9040',
                hash: 'python/hash/0x336ad904',
                module: 'secretflow.device.kernels.pyu',
                name: 'pyu_to_spu.<locals>.get_shares_chunk_count',
                boundvars: {
                  data: { kind: 'unbound', annotation: 'typing.Any' },
                  runtime_config: { kind: 'unbound', annotation: 'typing.Any' },
                  world_size: { kind: 'unbound', annotation: 'typing.Any' },
                  vtype: { kind: 'unbound', annotation: 'typing.Any' },
                },
                freevars: {
                  SPUIO: {
                    kind: 'object',
                    type: 'builtins.type',
                    id: 'python/id/0x13e0f2130',
                    hash: 'python/hash/0x13e0f213',
                    snapshot: "<class 'secretflow.device.device.spu.SPUIO'>",
                  },
                },
                retval: { kind: 'unbound', annotation: "<class 'int'>" },
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
                firstlineno: 67,
                source:
                  'def get_shares_chunk_count(data, runtime_config, world_size, vtype) -> int:\n    io = SPUIO(runtime_config, world_size)\n    return io.get_shares_chunk_count(data, vtype)\n',
              },
              num_returns: {
                kind: 'object',
                type: 'builtins.NoneType',
                id: 'python/id/0x1026e94f0',
                hash: 'python/hash/0x1026e94f',
                snapshot: 'None',
              },
              self: {
                kind: 'remote_location',
                type: 'secretflow.device.device.pyu.PYU',
                id: 'python/id/0x335297d00',
                location: ['PYU', 'bob'],
              },
              jax: {
                kind: 'object',
                type: 'builtins.module',
                id: 'python/id/0x10cdcfea0',
                hash: 'python/hash/0x10cdcfea',
                snapshot:
                  "<module 'jax' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/jax/__init__.py'>",
              },
              check_num_returns: {
                kind: 'function',
                type: 'builtins.function',
                id: 'python/id/0x17fcf2c10',
                hash: 'python/hash/0x17fcf2c1',
                module: 'secretflow.device.device._utils',
                name: 'check_num_returns',
                boundvars: {
                  fn: { kind: 'unbound', annotation: 'typing.Any' },
                },
                freevars: {
                  inspect: {
                    kind: 'object',
                    type: 'builtins.module',
                    id: 'python/id/0x102989270',
                    hash: 'python/hash/0x10298927',
                    snapshot:
                      "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                  },
                  hasattr: {
                    kind: 'object',
                    type: 'builtins.builtin_function_or_method',
                    id: 'python/id/0x1007789f0',
                    hash: 'python/hash/0x27a154',
                    snapshot: '<built-in function hasattr>',
                  },
                  len: {
                    kind: 'object',
                    type: 'builtins.builtin_function_or_method',
                    id: 'python/id/0x100778c70',
                    hash: 'python/hash/0x400000000027a1e0',
                    snapshot: '<built-in function len>',
                  },
                  isinstance: {
                    kind: 'object',
                    type: 'builtins.builtin_function_or_method',
                    id: 'python/id/0x100778b80',
                    hash: 'python/hash/0x27a186',
                    snapshot: '<built-in function isinstance>',
                  },
                  tuple: {
                    kind: 'object',
                    type: 'builtins.type',
                    id: 'python/id/0x1026e54a0',
                    hash: 'python/hash/0x1026e54a',
                    snapshot: "<class 'tuple'>",
                  },
                },
                retval: { kind: 'unbound', annotation: 'typing.Any' },
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/_utils.py',
                firstlineno: 4,
                source:
                  "def check_num_returns(fn):\n    # inspect.signature fails on some builtin method (e.g. numpy.random.rand).\n    # You can wrap a self define function which calls builtin function inside\n    # with return annotation to get multi returns for now.\n    if inspect.isbuiltin(fn):\n        sig = inspect.signature(lambda *arg, **kwargs: fn(*arg, **kwargs))\n    else:\n        sig = inspect.signature(fn)\n\n    if sig.return_annotation is None or sig.return_annotation == sig.empty:\n        num_returns = 1\n    else:\n        if (\n            hasattr(sig.return_annotation, '_name')\n            and sig.return_annotation._name == 'Tuple'\n        ):\n            num_returns = len(sig.return_annotation.__args__)\n        elif isinstance(sig.return_annotation, tuple):\n            num_returns = len(sig.return_annotation)\n        else:\n            num_returns = 1\n\n    return num_returns\n",
              },
              sfd: {
                kind: 'object',
                type: 'builtins.module',
                id: 'python/id/0x17fb8a450',
                hash: 'python/hash/0x17fb8a45',
                snapshot:
                  "<module 'secretflow.distributed' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/__init__.py'>",
              },
              logging: {
                kind: 'object',
                type: 'builtins.module',
                id: 'python/id/0x101987db0',
                hash: 'python/hash/0x101987db',
                snapshot:
                  "<module 'logging' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/logging/__init__.py'>",
              },
              len: {
                kind: 'object',
                type: 'builtins.builtin_function_or_method',
                id: 'python/id/0x100778c70',
                hash: 'python/hash/0x400000000027a1e0',
                snapshot: '<built-in function len>',
              },
              PYUObject: {
                kind: 'object',
                type: 'abc.ABCMeta',
                id: 'python/id/0x13e0f0320',
                hash: 'python/hash/0x13e0f032',
                snapshot: "<class 'secretflow.device.device.pyu.PYUObject'>",
              },
            },
            retval: { kind: 'unbound', annotation: 'typing.Any' },
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
            firstlineno: 83,
            source:
              "def wrapper(*args, **kwargs):\n    def try_get_data(arg, device):\n        if isinstance(arg, DeviceObject):\n            assert (\n                arg.device == device\n            ), f\"receive tensor {arg} in different device\"\n            return arg.data\n        return arg\n\n    args_, kwargs_ = jax.tree_util.tree_map(\n        lambda arg: try_get_data(arg, self), (args, kwargs)\n    )\n\n    _num_returns = check_num_returns(fn) if num_returns is None else num_returns\n    data = (\n        sfd.remote(self._run)\n        .party(self.party)\n        .options(num_returns=_num_returns)\n        .remote(fn, *args_, **kwargs_)\n    )\n    logging.debug(\n        (\n            f'PYU remote function: {fn}, num_returns={num_returns}, '\n            f'args len: {len(args)}, kwargs len: {len(kwargs)}.'\n        )\n    )\n    if _num_returns == 1:\n        return PYUObject(self, data)\n    else:\n        return [PYUObject(self, datum) for datum in data]\n",
          },
          filename:
            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
          firstlineno: 72,
          source:
            'def __call__(self, fn, *, num_returns=None, **kwargs):\n    """Set up ``fn`` for scheduling to this device.\n\n    Args:\n        func: Function to be schedule to this device.\n        num_returns: Number of returned PYUObject.\n\n    Returns:\n        A wrapped version of ``fn``, set up for device placement.\n    """\n\n    def wrapper(*args, **kwargs):\n        def try_get_data(arg, device):\n            if isinstance(arg, DeviceObject):\n                assert (\n                    arg.device == device\n                ), f"receive tensor {arg} in different device"\n                return arg.data\n            return arg\n\n        args_, kwargs_ = jax.tree_util.tree_map(\n            lambda arg: try_get_data(arg, self), (args, kwargs)\n        )\n\n        _num_returns = check_num_returns(fn) if num_returns is None else num_returns\n        data = (\n            sfd.remote(self._run)\n            .party(self.party)\n            .options(num_returns=_num_returns)\n            .remote(fn, *args_, **kwargs_)\n        )\n        logging.debug(\n            (\n                f\'PYU remote function: {fn}, num_returns={num_returns}, \'\n                f\'args len: {len(args)}, kwargs len: {len(kwargs)}.\'\n            )\n        )\n        if _num_returns == 1:\n            return PYUObject(self, data)\n        else:\n            return [PYUObject(self, datum) for datum in data]\n\n    return wrapper\n',
          docstring:
            'Set up ``fn`` for scheduling to this device.\n\nArgs:\n    func: Function to be schedule to this device.\n    num_returns: Number of returned PYUObject.\n\nReturns:\n    A wrapped version of ``fn``, set up for device placement.',
        },
        stackframes: [
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
            lineno: 72,
            func: '__call__',
            code: '    def __call__(self, fn, *, num_returns=None, **kwargs):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
            lineno: 76,
            func: 'pyu_to_spu',
            code: '    shares_chunk_count = self.device(get_shares_chunk_count)(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 80,
            func: 'dispatch',
            code: '        return self._ops[device_type][name](*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 111,
            func: 'dispatch',
            code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
            lineno: 68,
            func: 'to',
            code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
          },
          {
            filename: 'presets/millionaires/_algorithm.py',
            lineno: 29,
            func: '<module>',
            code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
          },
          {
            filename: 'Cell In[3]',
            lineno: 35,
            func: '<module>',
            code: '        exec(_algorithm, globals())\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3508,
            func: 'run_code',
            code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3448,
            func: 'run_ast_nodes',
            code: '                if await self.run_code(code, result, async_=asy):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3269,
            func: 'run_cell_async',
            code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
            lineno: 129,
            func: '_pseudo_sync_runner',
            code: '        coro.send(None)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3064,
            func: '_run_cell',
            code: '            result = runner(coro)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3009,
            func: 'run_cell',
            code: '            result = self._run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
            lineno: 546,
            func: 'run_cell',
            code: '        return super().run_cell(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
            lineno: 422,
            func: 'do_execute',
            code: '                    res = shell.run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 740,
            func: 'execute_request',
            code: '            reply_content = await reply_content\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 412,
            func: 'dispatch_shell',
            code: '                    await result\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 505,
            func: 'process_one',
            code: '        await dispatch(*args)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 516,
            func: 'dispatch_queue',
            code: '                await self.process_one()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
            lineno: 81,
            func: '_run',
            code: '            self._context.run(self._callback, *self._args)\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 1859,
            func: '_run_once',
            code: '                handle._run()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 570,
            func: 'run_forever',
            code: '                self._run_once()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
            lineno: 195,
            func: 'start',
            code: '        self.asyncio_loop.run_forever()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
            lineno: 736,
            func: 'start',
            code: '                self.io_loop.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
            lineno: 1051,
            func: 'launch_instance',
            code: '        app.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
            lineno: 17,
            func: '<module>',
            code: '    app.launch_new_instance()\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 87,
            func: '_run_code',
            code: '    exec(code, run_globals)\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 194,
            func: '_run_module_as_main',
            code: '    return _run_code(code, main_globals, None,\n',
          },
        ],
      },
      inner_calls: [],
    },
    {
      expression: {
        expr: 'invariant',
        semantic: 'exec',
        inputs: [
          {
            kind: 'driver',
            path: ['.0'],
            snapshot: {
              kind: 'object',
              type: 'ray._raylet.ObjectRef',
              id: 'ray/ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
              hash: 'python/hash/0x53b57d4a32661efb',
              snapshot:
                'ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
            },
          },
          {
            kind: 'driver',
            path: ['.1'],
            snapshot: {
              kind: 'object',
              type: 'libspu.spu_pb2.RuntimeConfig',
              id: 'python/id/0x29f3e3660',
              snapshot: 'protocol: SEMI2K\nfield: FM128\n',
            },
          },
          {
            kind: 'driver',
            path: ['.2'],
            snapshot: {
              kind: 'object',
              type: 'builtins.int',
              id: 'python/id/0x1026f1d30',
              hash: 'python/hash/0x2',
              snapshot: '2',
            },
          },
          {
            kind: 'driver',
            path: ['.3'],
            snapshot: {
              kind: 'object',
              type: 'builtins.int',
              id: 'python/id/0x17fa8be50',
              hash: 'python/hash/0x1',
              snapshot: '1',
            },
          },
          {
            kind: 'driver',
            path: ['(free variables)', 'SPUIO'],
            snapshot: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x13e0f2130',
              hash: 'python/hash/0x13e0f213',
              snapshot: "<class 'secretflow.device.device.spu.SPUIO'>",
            },
          },
        ],
        destination: ['PYU', 'bob'],
        outputs: [
          {
            kind: 'remote',
            path: [],
            index: 9,
            snapshot: {
              kind: 'remote_object',
              type: 'secretflow.device.device.pyu.PYUObject',
              id: 'secretflow/PYU/ray/ObjectRef(8849b62d89cb30f9ffffffffffffffffffffffff0100000001000000)',
              location: ['PYU', 'bob'],
            },
          },
        ],
      },
      span_id: '0x3e0eb6f501fdf5b6',
      start_time: '2023-10-25T09:37:49.225747',
      end_time: '2023-10-25T09:37:49.281720',
      call: {
        checkpoint: { api_level: 20 },
        snapshot: {
          kind: 'function',
          type: 'builtins.function',
          id: 'python/id/0x336b93700',
          hash: 'python/hash/0x336b9370',
          module: 'secretflow.device.device.pyu',
          name: 'PYU.__call__.<locals>.wrapper',
          boundvars: {
            args: {
              kind: 'sequence',
              type: 'builtins.tuple',
              id: 'python/id/0x336af8180',
              snapshot:
                '(ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000),\n protocol: SEMI2K\nfield: FM128\n,\n 2,\n 1)',
              values: [
                {
                  kind: 'object',
                  type: 'ray._raylet.ObjectRef',
                  id: 'ray/ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
                  hash: 'python/hash/0x53b57d4a32661efb',
                  snapshot:
                    'ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
                },
                {
                  kind: 'object',
                  type: 'libspu.spu_pb2.RuntimeConfig',
                  id: 'python/id/0x29f3e3660',
                  snapshot: 'protocol: SEMI2K\nfield: FM128\n',
                },
                {
                  kind: 'object',
                  type: 'builtins.int',
                  id: 'python/id/0x1026f1d30',
                  hash: 'python/hash/0x2',
                  snapshot: '2',
                },
                {
                  kind: 'object',
                  type: 'builtins.int',
                  id: 'python/id/0x17fa8be50',
                  hash: 'python/hash/0x1',
                  snapshot: '1',
                },
              ],
            },
            kwargs: {
              kind: 'mapping',
              type: 'builtins.dict',
              id: 'python/id/0x334fd1d40',
              snapshot: '{}',
              values: {},
            },
          },
          freevars: {
            fn: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x336ad9040',
              hash: 'python/hash/0x336ad904',
              module: 'secretflow.device.kernels.pyu',
              name: 'pyu_to_spu.<locals>.get_shares_chunk_count',
              boundvars: {
                data: { kind: 'unbound', annotation: 'typing.Any' },
                runtime_config: { kind: 'unbound', annotation: 'typing.Any' },
                world_size: { kind: 'unbound', annotation: 'typing.Any' },
                vtype: { kind: 'unbound', annotation: 'typing.Any' },
              },
              freevars: {
                SPUIO: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13e0f2130',
                  hash: 'python/hash/0x13e0f213',
                  snapshot: "<class 'secretflow.device.device.spu.SPUIO'>",
                },
              },
              retval: { kind: 'unbound', annotation: "<class 'int'>" },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
              firstlineno: 67,
              source:
                'def get_shares_chunk_count(data, runtime_config, world_size, vtype) -> int:\n    io = SPUIO(runtime_config, world_size)\n    return io.get_shares_chunk_count(data, vtype)\n',
            },
            num_returns: {
              kind: 'object',
              type: 'builtins.NoneType',
              id: 'python/id/0x1026e94f0',
              hash: 'python/hash/0x1026e94f',
              snapshot: 'None',
            },
            self: {
              kind: 'remote_location',
              type: 'secretflow.device.device.pyu.PYU',
              id: 'python/id/0x335297d00',
              location: ['PYU', 'bob'],
            },
            jax: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x10cdcfea0',
              hash: 'python/hash/0x10cdcfea',
              snapshot:
                "<module 'jax' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/jax/__init__.py'>",
            },
            check_num_returns: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x17fcf2c10',
              hash: 'python/hash/0x17fcf2c1',
              module: 'secretflow.device.device._utils',
              name: 'check_num_returns',
              boundvars: {
                fn: { kind: 'unbound', annotation: 'typing.Any' },
              },
              freevars: {
                inspect: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x102989270',
                  hash: 'python/hash/0x10298927',
                  snapshot:
                    "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                },
                hasattr: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x1007789f0',
                  hash: 'python/hash/0x27a154',
                  snapshot: '<built-in function hasattr>',
                },
                len: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778c70',
                  hash: 'python/hash/0x400000000027a1e0',
                  snapshot: '<built-in function len>',
                },
                isinstance: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778b80',
                  hash: 'python/hash/0x27a186',
                  snapshot: '<built-in function isinstance>',
                },
                tuple: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e54a0',
                  hash: 'python/hash/0x1026e54a',
                  snapshot: "<class 'tuple'>",
                },
              },
              retval: { kind: 'unbound', annotation: 'typing.Any' },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/_utils.py',
              firstlineno: 4,
              source:
                "def check_num_returns(fn):\n    # inspect.signature fails on some builtin method (e.g. numpy.random.rand).\n    # You can wrap a self define function which calls builtin function inside\n    # with return annotation to get multi returns for now.\n    if inspect.isbuiltin(fn):\n        sig = inspect.signature(lambda *arg, **kwargs: fn(*arg, **kwargs))\n    else:\n        sig = inspect.signature(fn)\n\n    if sig.return_annotation is None or sig.return_annotation == sig.empty:\n        num_returns = 1\n    else:\n        if (\n            hasattr(sig.return_annotation, '_name')\n            and sig.return_annotation._name == 'Tuple'\n        ):\n            num_returns = len(sig.return_annotation.__args__)\n        elif isinstance(sig.return_annotation, tuple):\n            num_returns = len(sig.return_annotation)\n        else:\n            num_returns = 1\n\n    return num_returns\n",
            },
            sfd: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x17fb8a450',
              hash: 'python/hash/0x17fb8a45',
              snapshot:
                "<module 'secretflow.distributed' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/__init__.py'>",
            },
            logging: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x101987db0',
              hash: 'python/hash/0x101987db',
              snapshot:
                "<module 'logging' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/logging/__init__.py'>",
            },
            len: {
              kind: 'object',
              type: 'builtins.builtin_function_or_method',
              id: 'python/id/0x100778c70',
              hash: 'python/hash/0x400000000027a1e0',
              snapshot: '<built-in function len>',
            },
            PYUObject: {
              kind: 'object',
              type: 'abc.ABCMeta',
              id: 'python/id/0x13e0f0320',
              hash: 'python/hash/0x13e0f032',
              snapshot: "<class 'secretflow.device.device.pyu.PYUObject'>",
            },
          },
          retval: {
            kind: 'remote_object',
            type: 'secretflow.device.device.pyu.PYUObject',
            id: 'secretflow/PYU/ray/ObjectRef(8849b62d89cb30f9ffffffffffffffffffffffff0100000001000000)',
            location: ['PYU', 'bob'],
          },
          filename:
            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
          firstlineno: 83,
          source:
            "def wrapper(*args, **kwargs):\n    def try_get_data(arg, device):\n        if isinstance(arg, DeviceObject):\n            assert (\n                arg.device == device\n            ), f\"receive tensor {arg} in different device\"\n            return arg.data\n        return arg\n\n    args_, kwargs_ = jax.tree_util.tree_map(\n        lambda arg: try_get_data(arg, self), (args, kwargs)\n    )\n\n    _num_returns = check_num_returns(fn) if num_returns is None else num_returns\n    data = (\n        sfd.remote(self._run)\n        .party(self.party)\n        .options(num_returns=_num_returns)\n        .remote(fn, *args_, **kwargs_)\n    )\n    logging.debug(\n        (\n            f'PYU remote function: {fn}, num_returns={num_returns}, '\n            f'args len: {len(args)}, kwargs len: {len(kwargs)}.'\n        )\n    )\n    if _num_returns == 1:\n        return PYUObject(self, data)\n    else:\n        return [PYUObject(self, datum) for datum in data]\n",
        },
        stackframes: [
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
            lineno: 83,
            func: 'wrapper',
            code: '        def wrapper(*args, **kwargs):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
            lineno: 76,
            func: 'pyu_to_spu',
            code: '    shares_chunk_count = self.device(get_shares_chunk_count)(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 80,
            func: 'dispatch',
            code: '        return self._ops[device_type][name](*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 111,
            func: 'dispatch',
            code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
            lineno: 68,
            func: 'to',
            code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
          },
          {
            filename: 'presets/millionaires/_algorithm.py',
            lineno: 29,
            func: '<module>',
            code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
          },
          {
            filename: 'Cell In[3]',
            lineno: 35,
            func: '<module>',
            code: '        exec(_algorithm, globals())\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3508,
            func: 'run_code',
            code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3448,
            func: 'run_ast_nodes',
            code: '                if await self.run_code(code, result, async_=asy):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3269,
            func: 'run_cell_async',
            code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
            lineno: 129,
            func: '_pseudo_sync_runner',
            code: '        coro.send(None)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3064,
            func: '_run_cell',
            code: '            result = runner(coro)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3009,
            func: 'run_cell',
            code: '            result = self._run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
            lineno: 546,
            func: 'run_cell',
            code: '        return super().run_cell(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
            lineno: 422,
            func: 'do_execute',
            code: '                    res = shell.run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 740,
            func: 'execute_request',
            code: '            reply_content = await reply_content\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 412,
            func: 'dispatch_shell',
            code: '                    await result\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 505,
            func: 'process_one',
            code: '        await dispatch(*args)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 516,
            func: 'dispatch_queue',
            code: '                await self.process_one()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
            lineno: 81,
            func: '_run',
            code: '            self._context.run(self._callback, *self._args)\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 1859,
            func: '_run_once',
            code: '                handle._run()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 570,
            func: 'run_forever',
            code: '                self._run_once()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
            lineno: 195,
            func: 'start',
            code: '        self.asyncio_loop.run_forever()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
            lineno: 736,
            func: 'start',
            code: '                self.io_loop.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
            lineno: 1051,
            func: 'launch_instance',
            code: '        app.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
            lineno: 17,
            func: '<module>',
            code: '    app.launch_new_instance()\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 87,
            func: '_run_code',
            code: '    exec(code, run_globals)\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 194,
            func: '_run_module_as_main',
            code: '    return _run_code(code, main_globals, None,\n',
          },
        ],
      },
      inner_calls: [
        {
          span_id: '0x280ac1b576a551f4',
          start_time: '2023-10-25T09:37:49.235370',
          end_time: '2023-10-25T09:37:49.236477',
          call: {
            checkpoint: { api_level: 10 },
            snapshot: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10b314700',
              hash: 'python/hash/0x10b31470',
              module: 'ray._private.worker',
              name: 'get',
              boundvars: {
                object_refs: {
                  kind: 'sequence',
                  type: 'builtins.list',
                  id: 'python/id/0x3352b4800',
                  snapshot:
                    '[ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)]',
                  values: [
                    {
                      kind: 'object',
                      type: 'ray._raylet.ObjectRef',
                      id: 'ray/ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
                      hash: 'python/hash/0x53b57d4a32661efb',
                      snapshot:
                        'ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
                    },
                  ],
                },
                timeout: {
                  kind: 'object',
                  type: 'builtins.NoneType',
                  id: 'python/id/0x1026e94f0',
                  hash: 'python/hash/0x1026e94f',
                  snapshot: 'None',
                },
              },
              freevars: {
                global_worker: {
                  kind: 'object',
                  type: 'ray._private.worker.Worker',
                  id: 'python/id/0x10b2ffe20',
                  hash: 'python/hash/0x10b2ffe2',
                  snapshot: '<ray._private.worker.Worker object at 0x10b2ffe20>',
                },
                hasattr: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x1007789f0',
                  hash: 'python/hash/0x27a154',
                  snapshot: '<built-in function hasattr>',
                },
                blocking_get_inside_async_warned: {
                  kind: 'object',
                  type: 'builtins.bool',
                  id: 'python/id/0x1026e8cd8',
                  hash: 'python/hash/0x0',
                  snapshot: 'False',
                },
                logger: {
                  kind: 'object',
                  type: 'logging.Logger',
                  id: 'python/id/0x10ac641f0',
                  hash: 'python/hash/0x10ac641f',
                  snapshot: '<Logger ray._private.worker (INFO)>',
                },
                profiling: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x10aaecc70',
                  hash: 'python/hash/0x10aaecc7',
                  snapshot:
                    "<module 'ray._private.profiling' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/profiling.py'>",
                },
                isinstance: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778b80',
                  hash: 'python/hash/0x27a186',
                  snapshot: '<built-in function isinstance>',
                },
                StreamingObjectRefGenerator: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13e02ec10',
                  hash: 'python/hash/0x13e02ec1',
                  snapshot: "<class 'ray._raylet.StreamingObjectRefGenerator'>",
                },
                ray: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x105576ef0',
                  hash: 'python/hash/0x105576ef',
                  snapshot:
                    "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                },
                list: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e9100',
                  hash: 'python/hash/0x1026e910',
                  snapshot: "<class 'list'>",
                },
                ValueError: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x10269d740',
                  hash: 'python/hash/0x10269d74',
                  snapshot: "<class 'ValueError'>",
                },
                enumerate: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026adff8',
                  hash: 'python/hash/-0x7fffffffefd95201',
                  snapshot: "<class 'enumerate'>",
                },
                RayError: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13e13fd00',
                  hash: 'python/hash/0x13e13fd0',
                  snapshot: "<class 'ray.exceptions.RayError'>",
                },
                RayTaskError: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13d625ff0',
                  hash: 'python/hash/0x13d625ff',
                  snapshot: "<class 'ray.exceptions.RayTaskError'>",
                },
                sys: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x10076cea0',
                  hash: 'python/hash/0x10076cea',
                  snapshot: "<module 'sys' (built-in)>",
                },
              },
              retval: {
                kind: 'sequence',
                type: 'builtins.list',
                id: 'python/id/0x336ba4ac0',
                snapshot: '[Array(47269504, dtype=int32)]',
                values: [
                  {
                    kind: 'object',
                    type: 'jaxlib.xla_extension.ArrayImpl',
                    id: 'python/id/0x12d3993a0',
                    snapshot: 'Array(47269504, dtype=int32)',
                  },
                ],
              },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/worker.py',
              firstlineno: 2439,
              source:
                '@PublicAPI\n@client_mode_hook\ndef get(\n    object_refs: Union[ray.ObjectRef, Sequence[ray.ObjectRef]],\n    *,\n    timeout: Optional[float] = None,\n) -> Union[Any, List[Any]]:\n    """Get a remote object or a list of remote objects from the object store.\n\n    This method blocks until the object corresponding to the object ref is\n    available in the local object store. If this object is not in the local\n    object store, it will be shipped from an object store that has it (once the\n    object has been created). If object_refs is a list, then the objects\n    corresponding to each object in the list will be returned.\n\n    Ordering for an input list of object refs is preserved for each object\n    returned. That is, if an object ref to A precedes an object ref to B in the\n    input list, then A will precede B in the returned list.\n\n    This method will issue a warning if it\'s running inside async context,\n    you can use ``await object_ref`` instead of ``ray.get(object_ref)``. For\n    a list of object refs, you can use ``await asyncio.gather(*object_refs)``.\n\n    Related patterns and anti-patterns:\n\n    - :doc:`/ray-core/patterns/ray-get-loop`\n    - :doc:`/ray-core/patterns/unnecessary-ray-get`\n    - :doc:`/ray-core/patterns/ray-get-submission-order`\n    - :doc:`/ray-core/patterns/ray-get-too-many-objects`\n\n\n    Args:\n        object_refs: Object ref of the object to get or a list of object refs\n            to get.\n        timeout (Optional[float]): The maximum amount of time in seconds to\n            wait before returning. Set this to None will block until the\n            corresponding object becomes available. Setting ``timeout=0`` will\n            return the object immediately if it\'s available, else raise\n            GetTimeoutError in accordance with the above docstring.\n\n    Returns:\n        A Python object or a list of Python objects.\n\n    Raises:\n        GetTimeoutError: A GetTimeoutError is raised if a timeout is set and\n            the get takes longer than timeout to return.\n        Exception: An exception is raised if the task that created the object\n            or that created one of the objects raised an exception.\n    """\n    worker = global_worker\n    worker.check_connected()\n\n    if hasattr(worker, "core_worker") and worker.core_worker.current_actor_is_asyncio():\n        global blocking_get_inside_async_warned\n        if not blocking_get_inside_async_warned:\n            logger.warning(\n                "Using blocking ray.get inside async actor. "\n                "This blocks the event loop. Please use `await` "\n                "on object ref with asyncio.gather if you want to "\n                "yield execution to the event loop instead."\n            )\n            blocking_get_inside_async_warned = True\n\n    with profiling.profile("ray.get"):\n        # TODO(sang): Should make StreamingObjectRefGenerator\n        # compatible to ray.get for dataset.\n        if isinstance(object_refs, StreamingObjectRefGenerator):\n            return object_refs\n\n        is_individual_id = isinstance(object_refs, ray.ObjectRef)\n        if is_individual_id:\n            object_refs = [object_refs]\n\n        if not isinstance(object_refs, list):\n            raise ValueError(\n                "\'object_refs\' must either be an ObjectRef or a list of ObjectRefs."\n            )\n\n        # TODO(ujvl): Consider how to allow user to retrieve the ready objects.\n        values, debugger_breakpoint = worker.get_objects(object_refs, timeout=timeout)\n        for i, value in enumerate(values):\n            if isinstance(value, RayError):\n                if isinstance(value, ray.exceptions.ObjectLostError):\n                    worker.core_worker.dump_object_store_memory_usage()\n                if isinstance(value, RayTaskError):\n                    raise value.as_instanceof_cause()\n                else:\n                    raise value\n\n        if is_individual_id:\n            values = values[0]\n\n        if debugger_breakpoint != b"":\n            frame = sys._getframe().f_back\n            rdb = ray.util.pdb._connect_ray_pdb(\n                host=None,\n                port=None,\n                patch_stdstreams=False,\n                quiet=None,\n                breakpoint_uuid=debugger_breakpoint.decode()\n                if debugger_breakpoint\n                else None,\n                debugger_external=worker.ray_debugger_external,\n            )\n            rdb.set_trace(frame=frame)\n\n        return values\n',
              docstring:
                "Get a remote object or a list of remote objects from the object store.\n\nThis method blocks until the object corresponding to the object ref is\navailable in the local object store. If this object is not in the local\nobject store, it will be shipped from an object store that has it (once the\nobject has been created). If object_refs is a list, then the objects\ncorresponding to each object in the list will be returned.\n\nOrdering for an input list of object refs is preserved for each object\nreturned. That is, if an object ref to A precedes an object ref to B in the\ninput list, then A will precede B in the returned list.\n\nThis method will issue a warning if it's running inside async context,\nyou can use ``await object_ref`` instead of ``ray.get(object_ref)``. For\na list of object refs, you can use ``await asyncio.gather(*object_refs)``.\n\nRelated patterns and anti-patterns:\n\n- :doc:`/ray-core/patterns/ray-get-loop`\n- :doc:`/ray-core/patterns/unnecessary-ray-get`\n- :doc:`/ray-core/patterns/ray-get-submission-order`\n- :doc:`/ray-core/patterns/ray-get-too-many-objects`\n\n\nArgs:\n    object_refs: Object ref of the object to get or a list of object refs\n        to get.\n    timeout (Optional[float]): The maximum amount of time in seconds to\n        wait before returning. Set this to None will block until the\n        corresponding object becomes available. Setting ``timeout=0`` will\n        return the object immediately if it's available, else raise\n        GetTimeoutError in accordance with the above docstring.\n\nReturns:\n    A Python object or a list of Python objects.\n\nRaises:\n    GetTimeoutError: A GetTimeoutError is raised if a timeout is set and\n        the get takes longer than timeout to return.\n    Exception: An exception is raised if the task that created the object\n        or that created one of the objects raised an exception.",
            },
            stackframes: [
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/worker.py',
                lineno: 2439,
                func: 'get',
                code: '@PublicAPI\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                lineno: 103,
                func: 'wrapper',
                code: '        return func(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/auto_init_hook.py',
                lineno: 24,
                func: 'auto_init_wrapper',
                code: '        return fn(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
                lineno: 97,
                func: '_resolve_args',
                code: '    actual_vals = ray.get(list(refs.values()))\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
                lineno: 107,
                func: '_remote',
                code: '        args, kwargs = _resolve_args(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
                lineno: 230,
                func: 'remote',
                code: '                return func_cls._remote(args=args, kwargs=kwargs, **updated_options)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
                lineno: 98,
                func: 'wrapper',
                code: '                sfd.remote(self._run)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
                lineno: 76,
                func: 'pyu_to_spu',
                code: '    shares_chunk_count = self.device(get_shares_chunk_count)(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 80,
                func: 'dispatch',
                code: '        return self._ops[device_type][name](*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 111,
                func: 'dispatch',
                code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
                lineno: 68,
                func: 'to',
                code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
              },
              {
                filename: 'presets/millionaires/_algorithm.py',
                lineno: 29,
                func: '<module>',
                code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
              },
              {
                filename: 'Cell In[3]',
                lineno: 35,
                func: '<module>',
                code: '        exec(_algorithm, globals())\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3508,
                func: 'run_code',
                code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3448,
                func: 'run_ast_nodes',
                code: '                if await self.run_code(code, result, async_=asy):\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3269,
                func: 'run_cell_async',
                code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
                lineno: 129,
                func: '_pseudo_sync_runner',
                code: '        coro.send(None)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3064,
                func: '_run_cell',
                code: '            result = runner(coro)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3009,
                func: 'run_cell',
                code: '            result = self._run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
                lineno: 546,
                func: 'run_cell',
                code: '        return super().run_cell(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
                lineno: 422,
                func: 'do_execute',
                code: '                    res = shell.run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 740,
                func: 'execute_request',
                code: '            reply_content = await reply_content\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 412,
                func: 'dispatch_shell',
                code: '                    await result\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 505,
                func: 'process_one',
                code: '        await dispatch(*args)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 516,
                func: 'dispatch_queue',
                code: '                await self.process_one()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
                lineno: 81,
                func: '_run',
                code: '            self._context.run(self._callback, *self._args)\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 1859,
                func: '_run_once',
                code: '                handle._run()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 570,
                func: 'run_forever',
                code: '                self._run_once()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
                lineno: 195,
                func: 'start',
                code: '        self.asyncio_loop.run_forever()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
                lineno: 736,
                func: 'start',
                code: '                self.io_loop.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
                lineno: 1051,
                func: 'launch_instance',
                code: '        app.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
                lineno: 17,
                func: '<module>',
                code: '    app.launch_new_instance()\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 87,
                func: '_run_code',
                code: '    exec(code, run_globals)\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 194,
                func: '_run_module_as_main',
                code: '    return _run_code(code, main_globals, None,\n',
              },
            ],
          },
          inner_calls: [],
        },
        {
          span_id: '0x35c1a4bc47aa5d04',
          start_time: '2023-10-25T09:37:49.259710',
          end_time: '2023-10-25T09:37:49.265979',
          call: {
            checkpoint: { api_level: 10 },
            snapshot: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10b2c2c10',
              hash: 'python/hash/0x10b2c2c1',
              module: 'ray.remote_function',
              name: 'RemoteFunction._remote',
              boundvars: {
                self: {
                  kind: 'object',
                  type: 'secretflow.distributed.primitive.RemoteFunctionWrapper',
                  id: 'python/id/0x336ae6a30',
                  hash: 'python/hash/0x336ae6a3',
                  snapshot:
                    '<secretflow.distributed.primitive.RemoteFunctionWrapper object at 0x336ae6a30>',
                },
                args: {
                  kind: 'sequence',
                  type: 'builtins.tuple',
                  id: 'python/id/0x3352baae0',
                  snapshot:
                    '(<function pyu_to_spu.<locals>.get_shares_chunk_count at 0x336ad9040>,\n Array(47269504, dtype=int32),\n protocol: SEMI2K\nfield: FM128\n,\n 2,\n 1)',
                  values: [
                    {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x336ad9040',
                      hash: 'python/hash/0x336ad904',
                      module: 'secretflow.device.kernels.pyu',
                      name: 'pyu_to_spu.<locals>.get_shares_chunk_count',
                      boundvars: {
                        data: { kind: 'unbound', annotation: 'typing.Any' },
                        runtime_config: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        world_size: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        vtype: { kind: 'unbound', annotation: 'typing.Any' },
                      },
                      freevars: {
                        SPUIO: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x13e0f2130',
                          hash: 'python/hash/0x13e0f213',
                          snapshot: "<class 'secretflow.device.device.spu.SPUIO'>",
                        },
                      },
                      retval: { kind: 'unbound', annotation: "<class 'int'>" },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
                      firstlineno: 67,
                      source:
                        'def get_shares_chunk_count(data, runtime_config, world_size, vtype) -> int:\n    io = SPUIO(runtime_config, world_size)\n    return io.get_shares_chunk_count(data, vtype)\n',
                    },
                    {
                      kind: 'object',
                      type: 'jaxlib.xla_extension.ArrayImpl',
                      id: 'python/id/0x12d3993a0',
                      snapshot: 'Array(47269504, dtype=int32)',
                    },
                    {
                      kind: 'object',
                      type: 'libspu.spu_pb2.RuntimeConfig',
                      id: 'python/id/0x29f3e3660',
                      snapshot: 'protocol: SEMI2K\nfield: FM128\n',
                    },
                    {
                      kind: 'object',
                      type: 'builtins.int',
                      id: 'python/id/0x1026f1d30',
                      hash: 'python/hash/0x2',
                      snapshot: '2',
                    },
                    {
                      kind: 'object',
                      type: 'builtins.int',
                      id: 'python/id/0x17fa8be50',
                      hash: 'python/hash/0x1',
                      snapshot: '1',
                    },
                  ],
                },
                kwargs: {
                  kind: 'mapping',
                  type: 'builtins.dict',
                  id: 'python/id/0x336bc29c0',
                  snapshot: '{}',
                  values: {},
                },
                task_options: {
                  kind: 'mapping',
                  type: 'builtins.dict',
                  id: 'python/id/0x336ba4a80',
                  snapshot: "{'num_returns': 1, 'resources': {'bob': 1}}",
                  values: {
                    num_returns: {
                      kind: 'object',
                      type: 'builtins.int',
                      id: 'python/id/0x1026f1d10',
                      hash: 'python/hash/0x1',
                      snapshot: '1',
                    },
                    resources: {
                      kind: 'mapping',
                      type: 'builtins.dict',
                      id: 'python/id/0x336ba4580',
                      snapshot: "{'bob': 1}",
                      values: {
                        bob: {
                          kind: 'object',
                          type: 'builtins.int',
                          id: 'python/id/0x1026f1d10',
                          hash: 'python/hash/0x1',
                          snapshot: '1',
                        },
                      },
                    },
                  },
                },
              },
              freevars: {
                auto_init_ray: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10a9629d0',
                  hash: 'python/hash/0x10a9629d',
                  module: 'ray._private.auto_init_hook',
                  name: 'auto_init_ray',
                  boundvars: {},
                  freevars: {
                    os: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x100826590',
                      hash: 'python/hash/0x10082659',
                      snapshot:
                        "<module 'os' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/os.py'>",
                    },
                    ray: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x105576ef0',
                      hash: 'python/hash/0x105576ef',
                      snapshot:
                        "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                    },
                    auto_init_lock: {
                      kind: 'object',
                      type: '_thread.lock',
                      id: 'python/id/0x10a9619f0',
                      hash: 'python/hash/0x10a9619f',
                      snapshot: '<unlocked _thread.lock object at 0x10a9619f0>',
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/auto_init_hook.py',
                  firstlineno: 9,
                  source:
                    'def auto_init_ray():\n    if (\n        os.environ.get("RAY_ENABLE_AUTO_CONNECT", "") != "0"\n        and not ray.is_initialized()\n    ):\n        auto_init_lock.acquire()\n        if not ray.is_initialized():\n            ray.init()\n        auto_init_lock.release()\n',
                },
                client_mode_should_convert: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10a9650d0',
                  hash: 'python/hash/0x10a9650d',
                  module: 'ray._private.client_mode_hook',
                  name: 'client_mode_should_convert',
                  boundvars: {},
                  freevars: {
                    is_client_mode_enabled: {
                      kind: 'object',
                      type: 'builtins.bool',
                      id: 'python/id/0x1026e8cd8',
                      hash: 'python/hash/0x0',
                      snapshot: 'False',
                    },
                    is_client_mode_enabled_by_default: {
                      kind: 'object',
                      type: 'builtins.bool',
                      id: 'python/id/0x1026e8cd8',
                      hash: 'python/hash/0x0',
                      snapshot: 'False',
                    },
                    _get_client_hook_status_on_thread: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10a962940',
                      hash: 'python/hash/0x10a96294',
                      module: 'ray._private.client_mode_hook',
                      name: '_get_client_hook_status_on_thread',
                      boundvars: {},
                      freevars: {
                        hasattr: {
                          kind: 'object',
                          type: 'builtins.builtin_function_or_method',
                          id: 'python/id/0x1007789f0',
                          hash: 'python/hash/0x27a154',
                          snapshot: '<built-in function hasattr>',
                        },
                        _client_hook_status_on_thread: {
                          kind: 'object',
                          type: '_thread._local',
                          id: 'python/id/0x10a9608b0',
                          hash: 'python/hash/0x10a9608b',
                          snapshot: '<_thread._local object at 0x10a9608b0>',
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'typing.Any' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                      firstlineno: 27,
                      source:
                        'def _get_client_hook_status_on_thread():\n    """Get\'s the value of `_client_hook_status_on_thread`.\n    Since `_client_hook_status_on_thread` is a thread-local variable, we may\n    need to add and set the \'status\' attribute.\n    """\n    global _client_hook_status_on_thread\n    if not hasattr(_client_hook_status_on_thread, "status"):\n        _client_hook_status_on_thread.status = True\n    return _client_hook_status_on_thread.status\n',
                      docstring:
                        "Get's the value of `_client_hook_status_on_thread`.\nSince `_client_hook_status_on_thread` is a thread-local variable, we may\nneed to add and set the 'status' attribute.",
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                  firstlineno: 108,
                  source:
                    'def client_mode_should_convert():\n    """Determines if functions should be converted to client mode."""\n\n    # `is_client_mode_enabled_by_default` is used for testing with\n    # `RAY_CLIENT_MODE=1`. This flag means all tests run with client mode.\n    return (\n        is_client_mode_enabled or is_client_mode_enabled_by_default\n    ) and _get_client_hook_status_on_thread()\n',
                  docstring:
                    'Determines if functions should be converted to client mode.',
                },
                client_mode_convert_function: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10a9651f0',
                  hash: 'python/hash/0x10a9651f',
                  module: 'ray._private.client_mode_hook',
                  name: 'client_mode_convert_function',
                  boundvars: {
                    func_cls: { kind: 'unbound', annotation: 'typing.Any' },
                    in_args: { kind: 'unbound', annotation: 'typing.Any' },
                    in_kwargs: { kind: 'unbound', annotation: 'typing.Any' },
                    kwargs: { kind: 'unbound', annotation: 'typing.Any' },
                  },
                  freevars: {
                    getattr: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x100778950',
                      hash: 'python/hash/0x400000000027a162',
                      snapshot: '<built-in function getattr>',
                    },
                    RAY_CLIENT_MODE_ATTR: {
                      kind: 'object',
                      type: 'builtins.str',
                      id: 'python/id/0x10a960260',
                      hash: 'python/hash/-0x4a78f7bc06cfd03c',
                      snapshot: "'__ray_client_mode_key__'",
                    },
                    setattr: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x10077a040',
                      hash: 'python/hash/-0x3fffffffffd85c5f',
                      snapshot: '<built-in function setattr>',
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                  firstlineno: 146,
                  source:
                    'def client_mode_convert_function(func_cls, in_args, in_kwargs, **kwargs):\n    """Runs a preregistered ray RemoteFunction through the ray client.\n\n    The common case for this is to transparently convert that RemoteFunction\n    to a ClientRemoteFunction. This happens in circumstances where the\n    RemoteFunction is declared early, in a library and only then is Ray used in\n    client mode -- necessitating a conversion.\n    """\n    from ray.util.client import ray\n\n    key = getattr(func_cls, RAY_CLIENT_MODE_ATTR, None)\n\n    # Second part of "or" is needed in case func_cls is reused between Ray\n    # client sessions in one Python interpreter session.\n    if (key is None) or (not ray._converted_key_exists(key)):\n        key = ray._convert_function(func_cls)\n        setattr(func_cls, RAY_CLIENT_MODE_ATTR, key)\n    client_func = ray._get_converted(key)\n    return client_func._remote(in_args, in_kwargs, **kwargs)\n',
                  docstring:
                    'Runs a preregistered ray RemoteFunction through the ray client.\n\nThe common case for this is to transparently convert that RemoteFunction\nto a ClientRemoteFunction. This happens in circumstances where the\nRemoteFunction is declared early, in a library and only then is Ray used in\nclient mode -- necessitating a conversion.',
                },
                ray: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x105576ef0',
                  hash: 'python/hash/0x105576ef',
                  snapshot:
                    "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                },
                PythonFunctionDescriptor: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x128e110d8',
                  hash: 'python/hash/-0x7fffffffed71eef3',
                  snapshot: "<class 'ray._raylet.PythonFunctionDescriptor'>",
                },
                pickle_dumps: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10adec0d0',
                  hash: 'python/hash/0x10adec0d',
                  module: 'ray._private.serialization',
                  name: 'pickle_dumps',
                  boundvars: {
                    obj: { kind: 'unbound', annotation: 'typing.Any' },
                    error_msg: { kind: 'unbound', annotation: "<class 'str'>" },
                  },
                  freevars: {
                    pickle: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x10565a8b0',
                      hash: 'python/hash/0x10565a8b',
                      snapshot:
                        "<module 'ray.cloudpickle' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/cloudpickle/__init__.py'>",
                    },
                    TypeError: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x102699ab0',
                      hash: 'python/hash/0x102699ab',
                      snapshot: "<class 'TypeError'>",
                    },
                    io: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x1008129f0',
                      hash: 'python/hash/0x1008129f',
                      snapshot:
                        "<module 'io' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/io.py'>",
                    },
                    inspect_serializability: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aad4670',
                      hash: 'python/hash/0x10aad467',
                      module: 'ray.util.check_serialize',
                      name: 'inspect_serializability',
                      boundvars: {
                        base_obj: { kind: 'unbound', annotation: 'typing.Any' },
                        name: {
                          kind: 'object',
                          type: 'builtins.NoneType',
                          id: 'python/id/0x1026e94f0',
                          hash: 'python/hash/0x1026e94f',
                          snapshot: 'None',
                        },
                        depth: {
                          kind: 'object',
                          type: 'builtins.int',
                          id: 'python/id/0x1026f1d50',
                          hash: 'python/hash/0x3',
                          snapshot: '3',
                        },
                        print_file: {
                          kind: 'object',
                          type: 'builtins.NoneType',
                          id: 'python/id/0x1026e94f0',
                          hash: 'python/hash/0x1026e94f',
                          snapshot: 'None',
                        },
                      },
                      freevars: {
                        _Printer: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x13e13e220',
                          hash: 'python/hash/0x13e13e22',
                          snapshot: "<class 'ray.util.check_serialize._Printer'>",
                        },
                        _inspect_serializability: {
                          kind: 'function',
                          type: 'builtins.function',
                          id: 'python/id/0x10aad4700',
                          hash: 'python/hash/0x10aad470',
                          module: 'ray.util.check_serialize',
                          name: '_inspect_serializability',
                          boundvars: {
                            base_obj: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            name: { kind: 'unbound', annotation: 'typing.Any' },
                            depth: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            parent: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            failure_set: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            printer: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                          },
                          freevars: {
                            colorama: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x105641720',
                              hash: 'python/hash/0x10564172',
                              snapshot:
                                "<module 'colorama' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/thirdparty_files/colorama/__init__.py'>",
                            },
                            set: {
                              kind: 'object',
                              type: 'builtins.type',
                              id: 'python/id/0x1026c9cb8',
                              hash: 'python/hash/-0x7fffffffefd93635',
                              snapshot: "<class 'set'>",
                            },
                            min: {
                              kind: 'object',
                              type: 'builtins.builtin_function_or_method',
                              id: 'python/id/0x100778d60',
                              hash: 'python/hash/0x400000000027a242',
                              snapshot: '<built-in function min>',
                            },
                            len: {
                              kind: 'object',
                              type: 'builtins.builtin_function_or_method',
                              id: 'python/id/0x100778c70',
                              hash: 'python/hash/0x400000000027a1e0',
                              snapshot: '<built-in function len>',
                            },
                            str: {
                              kind: 'object',
                              type: 'builtins.type',
                              id: 'python/id/0x1026e5300',
                              hash: 'python/hash/0x1026e530',
                              snapshot: "<class 'str'>",
                            },
                            cp: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x10565a8b0',
                              hash: 'python/hash/0x10565a8b',
                              snapshot:
                                "<module 'ray.cloudpickle' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/cloudpickle/__init__.py'>",
                            },
                            Exception: {
                              kind: 'object',
                              type: 'builtins.type',
                              id: 'python/id/0x102699910',
                              hash: 'python/hash/0x10269991',
                              snapshot: "<class 'Exception'>",
                            },
                            FailureTuple: {
                              kind: 'object',
                              type: 'builtins.type',
                              id: 'python/id/0x13e13e700',
                              hash: 'python/hash/0x13e13e70',
                              snapshot:
                                "<class 'ray.util.check_serialize.FailureTuple'>",
                            },
                            inspect: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x102989270',
                              hash: 'python/hash/0x10298927',
                              snapshot:
                                "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                            },
                            _inspect_func_serialization: {
                              kind: 'function',
                              type: 'builtins.function',
                              id: 'python/id/0x10aad4280',
                              hash: 'python/hash/0x10aad428',
                              module: 'ray.util.check_serialize',
                              name: '_inspect_func_serialization',
                              boundvars: {
                                base_obj: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                depth: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                parent: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                failure_set: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                printer: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                              },
                              freevars: {
                                inspect: {
                                  kind: 'object',
                                  type: 'builtins.module',
                                  id: 'python/id/0x102989270',
                                  hash: 'python/hash/0x10298927',
                                  snapshot:
                                    "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                                },
                                AssertionError: {
                                  kind: 'object',
                                  type: 'builtins.type',
                                  id: 'python/id/0x10269df60',
                                  hash: 'python/hash/0x10269df6',
                                  snapshot: "<class 'AssertionError'>",
                                },
                                len: {
                                  kind: 'object',
                                  type: 'builtins.builtin_function_or_method',
                                  id: 'python/id/0x100778c70',
                                  hash: 'python/hash/0x400000000027a1e0',
                                  snapshot: '<built-in function len>',
                                },
                                _inspect_serializability: {
                                  kind: 'ref',
                                  id: 'python/id/0x10aad4700',
                                },
                              },
                              retval: {
                                kind: 'unbound',
                                annotation: 'typing.Any',
                              },
                              filename:
                                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                              firstlineno: 52,
                              source:
                                'def _inspect_func_serialization(base_obj, depth, parent, failure_set, printer):\n    """Adds the first-found non-serializable element to the failure_set."""\n    assert inspect.isfunction(base_obj)\n    closure = inspect.getclosurevars(base_obj)\n    found = False\n    if closure.globals:\n        printer.print(\n            f"Detected {len(closure.globals)} global variables. "\n            "Checking serializability..."\n        )\n\n        with printer.indent():\n            for name, obj in closure.globals.items():\n                serializable, _ = _inspect_serializability(\n                    obj,\n                    name=name,\n                    depth=depth - 1,\n                    parent=parent,\n                    failure_set=failure_set,\n                    printer=printer,\n                )\n                found = found or not serializable\n                if found:\n                    break\n\n    if closure.nonlocals:\n        printer.print(\n            f"Detected {len(closure.nonlocals)} nonlocal variables. "\n            "Checking serializability..."\n        )\n        with printer.indent():\n            for name, obj in closure.nonlocals.items():\n                serializable, _ = _inspect_serializability(\n                    obj,\n                    name=name,\n                    depth=depth - 1,\n                    parent=parent,\n                    failure_set=failure_set,\n                    printer=printer,\n                )\n                found = found or not serializable\n                if found:\n                    break\n    if not found:\n        printer.print(\n            f"WARNING: Did not find non-serializable object in {base_obj}. "\n            "This may be an oversight."\n        )\n    return found\n',
                              docstring:
                                'Adds the first-found non-serializable element to the failure_set.',
                            },
                            _inspect_generic_serialization: {
                              kind: 'function',
                              type: 'builtins.function',
                              id: 'python/id/0x10aad45e0',
                              hash: 'python/hash/0x10aad45e',
                              module: 'ray.util.check_serialize',
                              name: '_inspect_generic_serialization',
                              boundvars: {
                                base_obj: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                depth: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                parent: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                failure_set: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                printer: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                              },
                              freevars: {
                                inspect: {
                                  kind: 'object',
                                  type: 'builtins.module',
                                  id: 'python/id/0x102989270',
                                  hash: 'python/hash/0x10298927',
                                  snapshot:
                                    "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                                },
                                AssertionError: {
                                  kind: 'object',
                                  type: 'builtins.type',
                                  id: 'python/id/0x10269df60',
                                  hash: 'python/hash/0x10269df6',
                                  snapshot: "<class 'AssertionError'>",
                                },
                                _inspect_serializability: {
                                  kind: 'ref',
                                  id: 'python/id/0x10aad4700',
                                },
                              },
                              retval: {
                                kind: 'unbound',
                                annotation: 'typing.Any',
                              },
                              filename:
                                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                              firstlineno: 103,
                              source:
                                'def _inspect_generic_serialization(base_obj, depth, parent, failure_set, printer):\n    """Adds the first-found non-serializable element to the failure_set."""\n    assert not inspect.isfunction(base_obj)\n    functions = inspect.getmembers(base_obj, predicate=inspect.isfunction)\n    found = False\n    with printer.indent():\n        for name, obj in functions:\n            serializable, _ = _inspect_serializability(\n                obj,\n                name=name,\n                depth=depth - 1,\n                parent=parent,\n                failure_set=failure_set,\n                printer=printer,\n            )\n            found = found or not serializable\n            if found:\n                break\n\n    with printer.indent():\n        members = inspect.getmembers(base_obj)\n        for name, obj in members:\n            if name.startswith("__") and name.endswith("__") or inspect.isbuiltin(obj):\n                continue\n            serializable, _ = _inspect_serializability(\n                obj,\n                name=name,\n                depth=depth - 1,\n                parent=parent,\n                failure_set=failure_set,\n                printer=printer,\n            )\n            found = found or not serializable\n            if found:\n                break\n    if not found:\n        printer.print(\n            f"WARNING: Did not find non-serializable object in {base_obj}. "\n            "This may be an oversight."\n        )\n    return found\n',
                              docstring:
                                'Adds the first-found non-serializable element to the failure_set.',
                            },
                          },
                          retval: {
                            kind: 'unbound',
                            annotation:
                              'typing.Tuple[bool, typing.Set[ray.util.check_serialize.FailureTuple]]',
                          },
                          filename:
                            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                          firstlineno: 172,
                          source:
                            'def _inspect_serializability(\n    base_obj, name, depth, parent, failure_set, printer\n) -> Tuple[bool, Set[FailureTuple]]:\n    colorama.init()\n    top_level = False\n    declaration = ""\n    found = False\n    if failure_set is None:\n        top_level = True\n        failure_set = set()\n        declaration = f"Checking Serializability of {base_obj}"\n        printer.print("=" * min(len(declaration), 80))\n        printer.print(declaration)\n        printer.print("=" * min(len(declaration), 80))\n\n        if name is None:\n            name = str(base_obj)\n    else:\n        printer.print(f"Serializing \'{name}\' {base_obj}...")\n    try:\n        cp.dumps(base_obj)\n        return True, failure_set\n    except Exception as e:\n        printer.print(\n            f"{colorama.Fore.RED}!!! FAIL{colorama.Fore.RESET} " f"serialization: {e}"\n        )\n        found = True\n        try:\n            if depth == 0:\n                failure_set.add(FailureTuple(base_obj, name, parent))\n        # Some objects may not be hashable, so we skip adding this to the set.\n        except Exception:\n            pass\n\n    if depth <= 0:\n        return False, failure_set\n\n    # TODO: we only differentiate between \'function\' and \'object\'\n    # but we should do a better job of diving into something\n    # more specific like a Type, Object, etc.\n    if inspect.isfunction(base_obj):\n        _inspect_func_serialization(\n            base_obj,\n            depth=depth,\n            parent=base_obj,\n            failure_set=failure_set,\n            printer=printer,\n        )\n    else:\n        _inspect_generic_serialization(\n            base_obj,\n            depth=depth,\n            parent=base_obj,\n            failure_set=failure_set,\n            printer=printer,\n        )\n\n    if not failure_set:\n        failure_set.add(FailureTuple(base_obj, name, parent))\n\n    if top_level:\n        printer.print("=" * min(len(declaration), 80))\n        if not failure_set:\n            printer.print(\n                "Nothing failed the inspect_serialization test, though "\n                "serialization did not succeed."\n            )\n        else:\n            fail_vars = (\n                f"\\n\\n\\t{colorama.Style.BRIGHT}"\n                + "\\n".join(str(k) for k in failure_set)\n                + f"{colorama.Style.RESET_ALL}\\n\\n"\n            )\n            printer.print(\n                f"Variable: {fail_vars}was found to be non-serializable. "\n                "There may be multiple other undetected variables that were "\n                "non-serializable. "\n            )\n            printer.print(\n                "Consider either removing the "\n                "instantiation/imports of these variables or moving the "\n                "instantiation into the scope of the function/class. "\n            )\n        printer.print("=" * min(len(declaration), 80))\n        printer.print(\n            "Check https://docs.ray.io/en/master/ray-core/objects/serialization.html#troubleshooting for more information."  # noqa\n        )\n        printer.print(\n            "If you have any suggestions on how to improve "\n            "this error message, please reach out to the "\n            "Ray developers on github.com/ray-project/ray/issues/"\n        )\n        printer.print("=" * min(len(declaration), 80))\n    return not found, failure_set\n',
                        },
                      },
                      retval: {
                        kind: 'unbound',
                        annotation:
                          'typing.Tuple[bool, typing.Set[ray.util.check_serialize.FailureTuple]]',
                      },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                      firstlineno: 146,
                      source:
                        '@DeveloperAPI\ndef inspect_serializability(\n    base_obj: Any,\n    name: Optional[str] = None,\n    depth: int = 3,\n    print_file: Optional[Any] = None,\n) -> Tuple[bool, Set[FailureTuple]]:\n    """Identifies what objects are preventing serialization.\n\n    Args:\n        base_obj: Object to be serialized.\n        name: Optional name of string.\n        depth: Depth of the scope stack to walk through. Defaults to 3.\n        print_file: file argument that will be passed to print().\n\n    Returns:\n        bool: True if serializable.\n        set[FailureTuple]: Set of unserializable objects.\n\n    .. versionadded:: 1.1.0\n\n    """\n    printer = _Printer(print_file)\n    return _inspect_serializability(base_obj, name, depth, None, None, printer)\n',
                      docstring:
                        'Identifies what objects are preventing serialization.\n\nArgs:\n    base_obj: Object to be serialized.\n    name: Optional name of string.\n    depth: Depth of the scope stack to walk through. Defaults to 3.\n    print_file: file argument that will be passed to print().\n\nReturns:\n    bool: True if serializable.\n    set[FailureTuple]: Set of unserializable objects.\n\n.. versionadded:: 1.1.0\n\n**DeveloperAPI:** This API may change across minor Ray releases.',
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/serialization.py',
                  firstlineno: 58,
                  source:
                    'def pickle_dumps(obj: Any, error_msg: str):\n    """Wrap cloudpickle.dumps to provide better error message\n    when the object is not serializable.\n    """\n    try:\n        return pickle.dumps(obj)\n    except TypeError as e:\n        sio = io.StringIO()\n        inspect_serializability(obj, print_file=sio)\n        msg = f"{error_msg}:\\n{sio.getvalue()}"\n        raise TypeError(msg) from e\n',
                  docstring:
                    'Wrap cloudpickle.dumps to provide better error message\nwhen the object is not serializable.',
                },
                ray_option_utils: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x10aa843b0',
                  hash: 'python/hash/0x10aa843b',
                  snapshot:
                    "<module 'ray._private.ray_option_utils' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/ray_option_utils.py'>",
                },
                os: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x100826590',
                  hash: 'python/hash/0x10082659',
                  snapshot:
                    "<module 'os' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/os.py'>",
                },
                int: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e5160',
                  hash: 'python/hash/0x1026e516',
                  snapshot: "<class 'int'>",
                },
                parse_runtime_env: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aab65e0',
                  hash: 'python/hash/0x10aab65e',
                  module: 'ray._private.utils',
                  name: 'parse_runtime_env',
                  boundvars: {
                    runtime_env: {
                      kind: 'unbound',
                      annotation:
                        "typing.Union[typing.Dict, ForwardRef('RuntimeEnv'), NoneType]",
                    },
                  },
                  freevars: {
                    isinstance: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x100778b80',
                      hash: 'python/hash/0x27a186',
                      snapshot: '<built-in function isinstance>',
                    },
                    dict: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x1026e8dc0',
                      hash: 'python/hash/0x1026e8dc',
                      snapshot: "<class 'dict'>",
                    },
                    TypeError: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x102699ab0',
                      hash: 'python/hash/0x102699ab',
                      snapshot: "<class 'TypeError'>",
                    },
                    type: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x1026e8698',
                      hash: 'python/hash/-0x7fffffffefd91797',
                      snapshot: "<class 'type'>",
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/utils.py',
                  firstlineno: 1599,
                  source:
                    'def parse_runtime_env(runtime_env: Optional[Union[Dict, "RuntimeEnv"]]):\n    from ray.runtime_env import RuntimeEnv\n\n    # Parse local pip/conda config files here. If we instead did it in\n    # .remote(), it would get run in the Ray Client server, which runs on\n    # a remote node where the files aren\'t available.\n    if runtime_env:\n        if isinstance(runtime_env, dict):\n            return RuntimeEnv(**(runtime_env or {}))\n        raise TypeError(\n            "runtime_env must be dict or RuntimeEnv, ",\n            f"but got: {type(runtime_env)}",\n        )\n    else:\n        # Keep the new_runtime_env as None.  In .remote(), we need to know\n        # if runtime_env is None to know whether or not to fall back to the\n        # runtime_env specified in the @ray.remote decorator.\n        return None\n',
                },
                isinstance: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778b80',
                  hash: 'python/hash/0x27a186',
                  snapshot: '<built-in function isinstance>',
                },
                list: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e9100',
                  hash: 'python/hash/0x1026e910',
                  snapshot: "<class 'list'>",
                },
                tuple: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e54a0',
                  hash: 'python/hash/0x1026e54a',
                  snapshot: "<class 'tuple'>",
                },
                PlacementGroupSchedulingStrategy: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13e139440',
                  hash: 'python/hash/0x13e13944',
                  snapshot:
                    "<class 'ray.util.scheduling_strategies.PlacementGroupSchedulingStrategy'>",
                },
                _warn_if_using_deprecated_placement_group: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aabf4c0',
                  hash: 'python/hash/0x10aabf4c',
                  module: 'ray._private.ray_option_utils',
                  name: '_warn_if_using_deprecated_placement_group',
                  boundvars: {
                    options: {
                      kind: 'unbound',
                      annotation: 'typing.Dict[str, typing.Any]',
                    },
                    caller_stacklevel: {
                      kind: 'unbound',
                      annotation: "<class 'int'>",
                    },
                  },
                  freevars: {
                    warnings: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x1008a52c0',
                      hash: 'python/hash/0x1008a52c',
                      snapshot:
                        "<module 'warnings' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/warnings.py'>",
                    },
                    get_ray_doc_version: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aab4b80',
                      hash: 'python/hash/0x10aab4b8',
                      module: 'ray._private.utils',
                      name: 'get_ray_doc_version',
                      boundvars: {},
                      freevars: {
                        re: {
                          kind: 'object',
                          type: 'builtins.module',
                          id: 'python/id/0x10093fe00',
                          hash: 'python/hash/0x10093fe0',
                          snapshot:
                            "<module 're' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/re.py'>",
                        },
                        ray: {
                          kind: 'object',
                          type: 'builtins.module',
                          id: 'python/id/0x105576ef0',
                          hash: 'python/hash/0x105576ef',
                          snapshot:
                            "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'typing.Any' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/utils.py',
                      firstlineno: 1081,
                      source:
                        'def get_ray_doc_version():\n    """Get the docs.ray.io version corresponding to the ray.__version__."""\n    # The ray.__version__ can be official Ray release (such as 1.12.0), or\n    # dev (3.0.0dev0) or release candidate (2.0.0rc0). For the later we map\n    # to the master doc version at docs.ray.io.\n    if re.match(r"^\\d+\\.\\d+\\.\\d+$", ray.__version__) is None:\n        return "master"\n    # For the former (official Ray release), we have corresponding doc version\n    # released as well.\n    return f"releases-{ray.__version__}"\n',
                      docstring:
                        'Get the docs.ray.io version corresponding to the ray.__version__.',
                    },
                    DeprecationWarning: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x10269f148',
                      hash: 'python/hash/-0x7fffffffefd960ec',
                      snapshot: "<class 'DeprecationWarning'>",
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/ray_option_utils.py',
                  firstlineno: 239,
                  source:
                    'def _warn_if_using_deprecated_placement_group(\n    options: Dict[str, Any], caller_stacklevel: int\n):\n    placement_group = options["placement_group"]\n    placement_group_bundle_index = options["placement_group_bundle_index"]\n    placement_group_capture_child_tasks = options["placement_group_capture_child_tasks"]\n    if placement_group != "default":\n        warnings.warn(\n            "placement_group parameter is deprecated. Use "\n            "scheduling_strategy=PlacementGroupSchedulingStrategy(...) "\n            "instead, see the usage at "\n            f"https://docs.ray.io/en/{get_ray_doc_version()}/ray-core/package-ref.html#ray-remote.",  # noqa: E501\n            DeprecationWarning,\n            stacklevel=caller_stacklevel + 1,\n        )\n    if placement_group_bundle_index != -1:\n        warnings.warn(\n            "placement_group_bundle_index parameter is deprecated. Use "\n            "scheduling_strategy=PlacementGroupSchedulingStrategy(...) "\n            "instead, see the usage at "\n            f"https://docs.ray.io/en/{get_ray_doc_version()}/ray-core/package-ref.html#ray-remote.",  # noqa: E501\n            DeprecationWarning,\n            stacklevel=caller_stacklevel + 1,\n        )\n    if placement_group_capture_child_tasks:\n        warnings.warn(\n            "placement_group_capture_child_tasks parameter is deprecated. Use "\n            "scheduling_strategy=PlacementGroupSchedulingStrategy(...) "\n            "instead, see the usage at "\n            f"https://docs.ray.io/en/{get_ray_doc_version()}/ray-core/package-ref.html#ray-remote.",  # noqa: E501\n            DeprecationWarning,\n            stacklevel=caller_stacklevel + 1,\n        )\n',
                },
                _configure_placement_group_based_on_context: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aac1550',
                  hash: 'python/hash/0x10aac155',
                  module: 'ray.util.placement_group',
                  name: '_configure_placement_group_based_on_context',
                  boundvars: {
                    placement_group_capture_child_tasks: {
                      kind: 'unbound',
                      annotation: "<class 'bool'>",
                    },
                    bundle_index: {
                      kind: 'unbound',
                      annotation: "<class 'int'>",
                    },
                    resources: { kind: 'unbound', annotation: 'typing.Dict' },
                    placement_resources: {
                      kind: 'unbound',
                      annotation: 'typing.Dict',
                    },
                    task_or_actor_repr: {
                      kind: 'unbound',
                      annotation: "<class 'str'>",
                    },
                    placement_group: {
                      kind: 'object',
                      type: 'builtins.str',
                      id: 'python/id/0x10077bc70',
                      hash: 'python/hash/0x16cd15e8cf278abb',
                      snapshot: "'default'",
                    },
                  },
                  freevars: {
                    AssertionError: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x10269df60',
                      hash: 'python/hash/0x10269df6',
                      snapshot: "<class 'AssertionError'>",
                    },
                    PlacementGroup: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x13e13a8a0',
                      hash: 'python/hash/0x13e13a8a',
                      snapshot: "<class 'ray.util.placement_group.PlacementGroup'>",
                    },
                    get_current_placement_group: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aac1310',
                      hash: 'python/hash/0x10aac131',
                      module: 'ray.util.placement_group',
                      name: 'get_current_placement_group',
                      boundvars: {},
                      freevars: {
                        auto_init_ray: {
                          kind: 'function',
                          type: 'builtins.function',
                          id: 'python/id/0x10a9629d0',
                          hash: 'python/hash/0x10a9629d',
                          module: 'ray._private.auto_init_hook',
                          name: 'auto_init_ray',
                          boundvars: {},
                          freevars: {
                            os: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x100826590',
                              hash: 'python/hash/0x10082659',
                              snapshot:
                                "<module 'os' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/os.py'>",
                            },
                            ray: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x105576ef0',
                              hash: 'python/hash/0x105576ef',
                              snapshot:
                                "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                            },
                            auto_init_lock: {
                              kind: 'object',
                              type: '_thread.lock',
                              id: 'python/id/0x10a9619f0',
                              hash: 'python/hash/0x10a9619f',
                              snapshot: '<unlocked _thread.lock object at 0x10a9619f0>',
                            },
                          },
                          retval: { kind: 'unbound', annotation: 'typing.Any' },
                          filename:
                            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/auto_init_hook.py',
                          firstlineno: 9,
                          source:
                            'def auto_init_ray():\n    if (\n        os.environ.get("RAY_ENABLE_AUTO_CONNECT", "") != "0"\n        and not ray.is_initialized()\n    ):\n        auto_init_lock.acquire()\n        if not ray.is_initialized():\n            ray.init()\n        auto_init_lock.release()\n',
                        },
                        client_mode_should_convert: {
                          kind: 'function',
                          type: 'builtins.function',
                          id: 'python/id/0x10a9650d0',
                          hash: 'python/hash/0x10a9650d',
                          module: 'ray._private.client_mode_hook',
                          name: 'client_mode_should_convert',
                          boundvars: {},
                          freevars: {
                            is_client_mode_enabled: {
                              kind: 'object',
                              type: 'builtins.bool',
                              id: 'python/id/0x1026e8cd8',
                              hash: 'python/hash/0x0',
                              snapshot: 'False',
                            },
                            is_client_mode_enabled_by_default: {
                              kind: 'object',
                              type: 'builtins.bool',
                              id: 'python/id/0x1026e8cd8',
                              hash: 'python/hash/0x0',
                              snapshot: 'False',
                            },
                            _get_client_hook_status_on_thread: {
                              kind: 'function',
                              type: 'builtins.function',
                              id: 'python/id/0x10a962940',
                              hash: 'python/hash/0x10a96294',
                              module: 'ray._private.client_mode_hook',
                              name: '_get_client_hook_status_on_thread',
                              boundvars: {},
                              freevars: {
                                hasattr: {
                                  kind: 'object',
                                  type: 'builtins.builtin_function_or_method',
                                  id: 'python/id/0x1007789f0',
                                  hash: 'python/hash/0x27a154',
                                  snapshot: '<built-in function hasattr>',
                                },
                                _client_hook_status_on_thread: {
                                  kind: 'object',
                                  type: '_thread._local',
                                  id: 'python/id/0x10a9608b0',
                                  hash: 'python/hash/0x10a9608b',
                                  snapshot: '<_thread._local object at 0x10a9608b0>',
                                },
                              },
                              retval: {
                                kind: 'unbound',
                                annotation: 'typing.Any',
                              },
                              filename:
                                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                              firstlineno: 27,
                              source:
                                'def _get_client_hook_status_on_thread():\n    """Get\'s the value of `_client_hook_status_on_thread`.\n    Since `_client_hook_status_on_thread` is a thread-local variable, we may\n    need to add and set the \'status\' attribute.\n    """\n    global _client_hook_status_on_thread\n    if not hasattr(_client_hook_status_on_thread, "status"):\n        _client_hook_status_on_thread.status = True\n    return _client_hook_status_on_thread.status\n',
                              docstring:
                                "Get's the value of `_client_hook_status_on_thread`.\nSince `_client_hook_status_on_thread` is a thread-local variable, we may\nneed to add and set the 'status' attribute.",
                            },
                          },
                          retval: { kind: 'unbound', annotation: 'typing.Any' },
                          filename:
                            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                          firstlineno: 108,
                          source:
                            'def client_mode_should_convert():\n    """Determines if functions should be converted to client mode."""\n\n    # `is_client_mode_enabled_by_default` is used for testing with\n    # `RAY_CLIENT_MODE=1`. This flag means all tests run with client mode.\n    return (\n        is_client_mode_enabled or is_client_mode_enabled_by_default\n    ) and _get_client_hook_status_on_thread()\n',
                          docstring:
                            'Determines if functions should be converted to client mode.',
                        },
                        ray: {
                          kind: 'object',
                          type: 'builtins.module',
                          id: 'python/id/0x105576ef0',
                          hash: 'python/hash/0x105576ef',
                          snapshot:
                            "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                        },
                        PlacementGroup: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x13e13a8a0',
                          hash: 'python/hash/0x13e13a8a',
                          snapshot: "<class 'ray.util.placement_group.PlacementGroup'>",
                        },
                      },
                      retval: {
                        kind: 'unbound',
                        annotation:
                          'typing.Union[ray.util.placement_group.PlacementGroup, NoneType]',
                      },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                      firstlineno: 296,
                      source:
                        '@PublicAPI\ndef get_current_placement_group() -> Optional[PlacementGroup]:\n    """Get the current placement group which a task or actor is using.\n\n    It returns None if there\'s no current placement group for the worker.\n    For example, if you call this method in your driver, it returns None\n    (because drivers never belong to any placement group).\n\n    Examples:\n        .. testcode::\n\n            import ray\n            from ray.util.placement_group import get_current_placement_group\n            from ray.util.scheduling_strategies import PlacementGroupSchedulingStrategy\n\n            @ray.remote\n            def f():\n                # This returns the placement group the task f belongs to.\n                # It means this pg is identical to the pg created below.\n                return get_current_placement_group()\n\n            pg = ray.util.placement_group([{"CPU": 2}])\n            assert ray.get(f.options(\n                    scheduling_strategy=PlacementGroupSchedulingStrategy(\n                        placement_group=pg)).remote()) == pg\n\n            # Driver doesn\'t belong to any placement group,\n            # so it returns None.\n            assert get_current_placement_group() is None\n\n    Return:\n        PlacementGroup: Placement group object.\n            None if the current task or actor wasn\'t\n            created with any placement group.\n    """\n    auto_init_ray()\n    if client_mode_should_convert():\n        # Client mode is only a driver.\n        return None\n    worker = ray._private.worker.global_worker\n    worker.check_connected()\n    pg_id = worker.placement_group_id\n    if pg_id.is_nil():\n        return None\n    return PlacementGroup(pg_id)\n',
                      docstring:
                        "Get the current placement group which a task or actor is using.\n\nIt returns None if there's no current placement group for the worker.\nFor example, if you call this method in your driver, it returns None\n(because drivers never belong to any placement group).\n\nExamples:\n    .. testcode::\n\n        import ray\n        from ray.util.placement_group import get_current_placement_group\n        from ray.util.scheduling_strategies import PlacementGroupSchedulingStrategy\n\n        @ray.remote\n        def f():\n            # This returns the placement group the task f belongs to.\n            # It means this pg is identical to the pg created below.\n            return get_current_placement_group()\n\n        pg = ray.util.placement_group([{\"CPU\": 2}])\n        assert ray.get(f.options(\n                scheduling_strategy=PlacementGroupSchedulingStrategy(\n                    placement_group=pg)).remote()) == pg\n\n        # Driver doesn't belong to any placement group,\n        # so it returns None.\n        assert get_current_placement_group() is None\n\nReturn:\n    PlacementGroup: Placement group object.\n        None if the current task or actor wasn't\n        created with any placement group.\n\nPublicAPI: This API is stable across Ray releases.",
                    },
                    isinstance: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x100778b80',
                      hash: 'python/hash/0x27a186',
                      snapshot: '<built-in function isinstance>',
                    },
                    check_placement_group_index: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aac13a0',
                      hash: 'python/hash/0x10aac13a',
                      module: 'ray.util.placement_group',
                      name: 'check_placement_group_index',
                      boundvars: {
                        placement_group: {
                          kind: 'unbound',
                          annotation:
                            "<class 'ray.util.placement_group.PlacementGroup'>",
                        },
                        bundle_index: {
                          kind: 'unbound',
                          annotation: "<class 'int'>",
                        },
                      },
                      freevars: {
                        AssertionError: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x10269df60',
                          hash: 'python/hash/0x10269df6',
                          snapshot: "<class 'AssertionError'>",
                        },
                        ValueError: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x10269d740',
                          hash: 'python/hash/0x10269d74',
                          snapshot: "<class 'ValueError'>",
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'None' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                      firstlineno: 343,
                      source:
                        'def check_placement_group_index(\n    placement_group: PlacementGroup, bundle_index: int\n) -> None:\n    assert placement_group is not None\n    if placement_group.id.is_nil():\n        if bundle_index != -1:\n            raise ValueError(\n                "If placement group is not set, "\n                "the value of bundle index must be -1."\n            )\n    elif bundle_index >= placement_group.bundle_count or bundle_index < -1:\n        raise ValueError(\n            f"placement group bundle index {bundle_index} "\n            f"is invalid. Valid placement group indexes: "\n            f"0-{placement_group.bundle_count}"\n        )\n',
                    },
                    _validate_resource_shape: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aac14c0',
                      hash: 'python/hash/0x10aac14c',
                      module: 'ray.util.placement_group',
                      name: '_validate_resource_shape',
                      boundvars: {
                        placement_group: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        resources: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        placement_resources: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        task_or_actor_repr: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                      },
                      freevars: {
                        _valid_resource_shape: {
                          kind: 'function',
                          type: 'builtins.function',
                          id: 'python/id/0x10aac1430',
                          hash: 'python/hash/0x10aac143',
                          module: 'ray.util.placement_group',
                          name: '_valid_resource_shape',
                          boundvars: {
                            resources: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            bundle_specs: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                          },
                          freevars: {
                            BUNDLE_RESOURCE_LABEL: {
                              kind: 'object',
                              type: 'builtins.str',
                              id: 'python/id/0x1041b8ef0',
                              hash: 'python/hash/0xea1fe391db5f16a',
                              snapshot: "'bundle'",
                            },
                          },
                          retval: { kind: 'unbound', annotation: 'typing.Any' },
                          filename:
                            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                          firstlineno: 361,
                          source:
                            'def _valid_resource_shape(resources, bundle_specs):\n    """\n    If the resource shape cannot fit into every\n    bundle spec, return False\n    """\n    for bundle in bundle_specs:\n        fit_in_bundle = True\n        for resource, requested_val in resources.items():\n            # Skip "bundle" resource as it is automatically added\n            # to all nodes with bundles by the placement group.\n            if resource == BUNDLE_RESOURCE_LABEL:\n                continue\n            if bundle.get(resource, 0) < requested_val:\n                fit_in_bundle = False\n                break\n        if fit_in_bundle:\n            # If resource request fits in any bundle, it is valid.\n            return True\n    return False\n',
                          docstring:
                            'If the resource shape cannot fit into every\nbundle spec, return False',
                        },
                        ValueError: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x10269d740',
                          hash: 'python/hash/0x10269d74',
                          snapshot: "<class 'ValueError'>",
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'typing.Any' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                      firstlineno: 382,
                      source:
                        'def _validate_resource_shape(\n    placement_group, resources, placement_resources, task_or_actor_repr\n):\n    bundles = placement_group.bundle_specs\n    resources_valid = _valid_resource_shape(resources, bundles)\n    placement_resources_valid = _valid_resource_shape(placement_resources, bundles)\n\n    if not resources_valid:\n        raise ValueError(\n            f"Cannot schedule {task_or_actor_repr} with "\n            "the placement group because the resource request "\n            f"{resources} cannot fit into any bundles for "\n            f"the placement group, {bundles}."\n        )\n    if not placement_resources_valid:\n        # Happens for the default actor case.\n        # placement_resources is not an exposed concept to users,\n        # so we should write more specialized error messages.\n        raise ValueError(\n            f"Cannot schedule {task_or_actor_repr} with "\n            "the placement group because the actor requires "\n            f"{placement_resources.get(\'CPU\', 0)} CPU for "\n            "creation, but it cannot "\n            f"fit into any bundles for the placement group, "\n            f"{bundles}. Consider "\n            "creating a placement group with CPU resources."\n        )\n',
                    },
                  },
                  retval: {
                    kind: 'unbound',
                    annotation: "<class 'ray.util.placement_group.PlacementGroup'>",
                  },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                  firstlineno: 411,
                  source:
                    'def _configure_placement_group_based_on_context(\n    placement_group_capture_child_tasks: bool,\n    bundle_index: int,\n    resources: Dict,\n    placement_resources: Dict,\n    task_or_actor_repr: str,\n    placement_group: Union[PlacementGroup, str, None] = "default",\n) -> PlacementGroup:\n    """Configure the placement group based on the given context.\n\n    Based on the given context, this API returns the placement group instance\n    for task/actor scheduling.\n\n    Params:\n        placement_group_capture_child_tasks: Whether or not the\n            placement group needs to be captured from the global\n            context.\n        bundle_index: The bundle index for tasks/actor scheduling.\n        resources: The scheduling resources.\n        placement_resources: The scheduling placement resources for\n            actors.\n        task_or_actor_repr: The repr of task or actor\n            function/class descriptor.\n        placement_group: The placement group instance.\n            - "default": Default placement group argument. Currently,\n                the default behavior is to capture the parent task\'\n                placement group if placement_group_capture_child_tasks\n                is set.\n            - None: means placement group is explicitly not configured.\n            - Placement group instance: In this case, do nothing.\n\n    Returns:\n        Placement group instance based on the given context.\n\n    Raises:\n        ValueError: If the bundle index is invalid for the placement group\n            or the requested resources shape doesn\'t fit to any\n            bundles.\n    """\n    # Validate inputs.\n    assert placement_group_capture_child_tasks is not None\n    assert resources is not None\n\n    # Validate and get the PlacementGroup instance.\n    # Placement group could be None, default, or placement group.\n    # Default behavior is "do not capture child tasks".\n    if placement_group != "default":\n        if not placement_group:\n            placement_group = PlacementGroup.empty()\n    elif placement_group == "default":\n        if placement_group_capture_child_tasks:\n            placement_group = get_current_placement_group()\n        else:\n            placement_group = PlacementGroup.empty()\n\n    if not placement_group:\n        placement_group = PlacementGroup.empty()\n    assert isinstance(placement_group, PlacementGroup)\n\n    # Validate the index.\n    check_placement_group_index(placement_group, bundle_index)\n\n    # Validate the shape.\n    if not placement_group.is_empty:\n        _validate_resource_shape(\n            placement_group, resources, placement_resources, task_or_actor_repr\n        )\n    return placement_group\n',
                  docstring:
                    'Configure the placement group based on the given context.\n\nBased on the given context, this API returns the placement group instance\nfor task/actor scheduling.\n\nParams:\n    placement_group_capture_child_tasks: Whether or not the\n        placement group needs to be captured from the global\n        context.\n    bundle_index: The bundle index for tasks/actor scheduling.\n    resources: The scheduling resources.\n    placement_resources: The scheduling placement resources for\n        actors.\n    task_or_actor_repr: The repr of task or actor\n        function/class descriptor.\n    placement_group: The placement group instance.\n        - "default": Default placement group argument. Currently,\n            the default behavior is to capture the parent task\'\n            placement group if placement_group_capture_child_tasks\n            is set.\n        - None: means placement group is explicitly not configured.\n        - Placement group instance: In this case, do nothing.\n\nReturns:\n    Placement group instance based on the given context.\n\nRaises:\n    ValueError: If the bundle index is invalid for the placement group\n        or the requested resources shape doesn\'t fit to any\n        bundles.',
                },
                get_runtime_env_info: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aab6550',
                  hash: 'python/hash/0x10aab655',
                  module: 'ray._private.utils',
                  name: 'get_runtime_env_info',
                  boundvars: {
                    runtime_env: { kind: 'unbound', annotation: 'RuntimeEnv' },
                    is_job_runtime_env: {
                      kind: 'object',
                      type: 'builtins.bool',
                      id: 'python/id/0x1026e8cd8',
                      hash: 'python/hash/0x0',
                      snapshot: 'False',
                    },
                    serialize: {
                      kind: 'object',
                      type: 'builtins.bool',
                      id: 'python/id/0x1026e8cd8',
                      hash: 'python/hash/0x0',
                      snapshot: 'False',
                    },
                  },
                  freevars: {
                    ProtoRuntimeEnvInfo: {
                      kind: 'object',
                      type: 'google.protobuf.internal.python_message.GeneratedProtocolMessageType',
                      id: 'python/id/0x10329b610',
                      hash: 'python/hash/0x10329b61',
                      snapshot:
                        "<class 'src.ray.protobuf.runtime_env_common_pb2.RuntimeEnvInfo'>",
                    },
                    len: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x100778c70',
                      hash: 'python/hash/0x400000000027a1e0',
                      snapshot: '<built-in function len>',
                    },
                    isinstance: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x100778b80',
                      hash: 'python/hash/0x27a186',
                      snapshot: '<built-in function isinstance>',
                    },
                    bool: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x1026d9340',
                      hash: 'python/hash/0x1026d934',
                      snapshot: "<class 'bool'>",
                    },
                    TypeError: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x102699ab0',
                      hash: 'python/hash/0x102699ab',
                      snapshot: "<class 'TypeError'>",
                    },
                    type: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x1026e8698',
                      hash: 'python/hash/-0x7fffffffefd91797',
                      snapshot: "<class 'type'>",
                    },
                    json_format: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x10aaa0450',
                      hash: 'python/hash/0x10aaa045',
                      snapshot:
                        "<module 'google.protobuf.json_format' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/google/protobuf/json_format.py'>",
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/utils.py',
                  firstlineno: 1537,
                  source:
                    'def get_runtime_env_info(\n    runtime_env: "RuntimeEnv",\n    *,\n    is_job_runtime_env: bool = False,\n    serialize: bool = False,\n):\n    """Create runtime env info from runtime env.\n\n    In the user interface, the argument `runtime_env` contains some fields\n    which not contained in `ProtoRuntimeEnv` but in `ProtoRuntimeEnvInfo`,\n    such as `eager_install`. This function will extract those fields from\n    `RuntimeEnv` and create a new `ProtoRuntimeEnvInfo`, and serialize it.\n    """\n    from ray.runtime_env import RuntimeEnvConfig\n\n    proto_runtime_env_info = ProtoRuntimeEnvInfo()\n\n    if runtime_env.working_dir_uri():\n        proto_runtime_env_info.uris.working_dir_uri = runtime_env.working_dir_uri()\n    if len(runtime_env.py_modules_uris()) > 0:\n        proto_runtime_env_info.uris.py_modules_uris[:] = runtime_env.py_modules_uris()\n\n    # TODO(Catch-Bull): overload `__setitem__` for `RuntimeEnv`, change the\n    # runtime_env of all internal code from dict to RuntimeEnv.\n\n    runtime_env_config = runtime_env.get("config")\n    if runtime_env_config is None:\n        runtime_env_config = RuntimeEnvConfig.default_config()\n    else:\n        runtime_env_config = RuntimeEnvConfig.parse_and_validate_runtime_env_config(\n            runtime_env_config\n        )\n\n    proto_runtime_env_info.runtime_env_config.CopyFrom(\n        runtime_env_config.build_proto_runtime_env_config()\n    )\n\n    # Normally, `RuntimeEnv` should guarantee the accuracy of field eager_install,\n    # but so far, the internal code has not completely prohibited direct\n    # modification of fields in RuntimeEnv, so we should check it for insurance.\n    eager_install = (\n        runtime_env_config.get("eager_install")\n        if runtime_env_config is not None\n        else None\n    )\n    if is_job_runtime_env or eager_install is not None:\n        if eager_install is None:\n            eager_install = True\n        elif not isinstance(eager_install, bool):\n            raise TypeError(\n                f"eager_install must be a boolean. got {type(eager_install)}"\n            )\n        proto_runtime_env_info.runtime_env_config.eager_install = eager_install\n\n    proto_runtime_env_info.serialized_runtime_env = runtime_env.serialize()\n\n    if not serialize:\n        return proto_runtime_env_info\n\n    return json_format.MessageToJson(proto_runtime_env_info)\n',
                  docstring:
                    'Create runtime env info from runtime env.\n\nIn the user interface, the argument `runtime_env` contains some fields\nwhich not contained in `ProtoRuntimeEnv` but in `ProtoRuntimeEnvInfo`,\nsuch as `eager_install`. This function will extract those fields from\n`RuntimeEnv` and create a new `ProtoRuntimeEnvInfo`, and serialize it.',
                },
                _task_launch_hook: {
                  kind: 'object',
                  type: 'builtins.NoneType',
                  id: 'python/id/0x1026e94f0',
                  hash: 'python/hash/0x1026e94f',
                  snapshot: 'None',
                },
              },
              retval: {
                kind: 'object',
                type: 'ray._raylet.ObjectRef',
                id: 'ray/ObjectRef(8849b62d89cb30f9ffffffffffffffffffffffff0100000001000000)',
                hash: 'python/hash/0x58737c690b203ac',
                snapshot:
                  'ObjectRef(8849b62d89cb30f9ffffffffffffffffffffffff0100000001000000)',
              },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
              firstlineno: 244,
              source:
                '@_tracing_task_invocation\ndef _remote(self, args=None, kwargs=None, **task_options):\n    """Submit the remote function for execution."""\n    # We pop the "max_calls" coming from "@ray.remote" here. We no longer need\n    # it in "_remote()".\n    task_options.pop("max_calls", None)\n    auto_init_ray()\n    if client_mode_should_convert():\n        return client_mode_convert_function(self, args, kwargs, **task_options)\n\n    worker = ray._private.worker.global_worker\n    worker.check_connected()\n\n    # If this function was not exported in this session and job, we need to\n    # export this function again, because the current GCS doesn\'t have it.\n    if (\n        not self._is_cross_language\n        and self._last_export_session_and_job != worker.current_session_and_job\n    ):\n        self._function_descriptor = PythonFunctionDescriptor.from_function(\n            self._function, self._uuid\n        )\n        # There is an interesting question here. If the remote function is\n        # used by a subsequent driver (in the same script), should the\n        # second driver pickle the function again? If yes, then the remote\n        # function definition can differ in the second driver (e.g., if\n        # variables in its closure have changed). We probably want the\n        # behavior of the remote function in the second driver to be\n        # independent of whether or not the function was invoked by the\n        # first driver. This is an argument for repickling the function,\n        # which we do here.\n        self._pickled_function = pickle_dumps(\n            self._function,\n            f"Could not serialize the function {self._function_descriptor.repr}",\n        )\n\n        self._last_export_session_and_job = worker.current_session_and_job\n        worker.function_actor_manager.export(self)\n\n    kwargs = {} if kwargs is None else kwargs\n    args = [] if args is None else args\n\n    # fill task required options\n    for k, v in ray_option_utils.task_options.items():\n        if k == "max_retries":\n            # TODO(swang): We need to override max_retries here because the default\n            # value gets set at Ray import time. Ideally, we should allow setting\n            # default values from env vars for other options too.\n            v.default_value = os.environ.get(\n                "RAY_TASK_MAX_RETRIES", v.default_value\n            )\n            v.default_value = int(v.default_value)\n        task_options[k] = task_options.get(k, v.default_value)\n    # "max_calls" already takes effects and should not apply again.\n    # Remove the default value here.\n    task_options.pop("max_calls", None)\n\n    # TODO(suquark): cleanup these fields\n    name = task_options["name"]\n    runtime_env = parse_runtime_env(task_options["runtime_env"])\n    placement_group = task_options["placement_group"]\n    placement_group_bundle_index = task_options["placement_group_bundle_index"]\n    placement_group_capture_child_tasks = task_options[\n        "placement_group_capture_child_tasks"\n    ]\n    scheduling_strategy = task_options["scheduling_strategy"]\n    num_returns = task_options["num_returns"]\n    if num_returns == "dynamic":\n        num_returns = -1\n    elif num_returns == "streaming":\n        # TODO(sang): This is a temporary private API.\n        # Remove it when we migrate to the streaming generator.\n        num_returns = ray._raylet.STREAMING_GENERATOR_RETURN\n\n    max_retries = task_options["max_retries"]\n    retry_exceptions = task_options["retry_exceptions"]\n    if isinstance(retry_exceptions, (list, tuple)):\n        retry_exception_allowlist = tuple(retry_exceptions)\n        retry_exceptions = True\n    else:\n        retry_exception_allowlist = None\n\n    if scheduling_strategy is None or not isinstance(\n        scheduling_strategy, PlacementGroupSchedulingStrategy\n    ):\n        _warn_if_using_deprecated_placement_group(task_options, 4)\n\n    resources = ray._private.utils.resources_from_ray_options(task_options)\n\n    if scheduling_strategy is None or isinstance(\n        scheduling_strategy, PlacementGroupSchedulingStrategy\n    ):\n        if isinstance(scheduling_strategy, PlacementGroupSchedulingStrategy):\n            placement_group = scheduling_strategy.placement_group\n            placement_group_bundle_index = (\n                scheduling_strategy.placement_group_bundle_index\n            )\n            placement_group_capture_child_tasks = (\n                scheduling_strategy.placement_group_capture_child_tasks\n            )\n\n        if placement_group_capture_child_tasks is None:\n            placement_group_capture_child_tasks = (\n                worker.should_capture_child_tasks_in_placement_group\n            )\n        placement_group = _configure_placement_group_based_on_context(\n            placement_group_capture_child_tasks,\n            placement_group_bundle_index,\n            resources,\n            {},  # no placement_resources for tasks\n            self._function_descriptor.function_name,\n            placement_group=placement_group,\n        )\n        if not placement_group.is_empty:\n            scheduling_strategy = PlacementGroupSchedulingStrategy(\n                placement_group,\n                placement_group_bundle_index,\n                placement_group_capture_child_tasks,\n            )\n        else:\n            scheduling_strategy = "DEFAULT"\n\n    serialized_runtime_env_info = None\n    if runtime_env is not None:\n        serialized_runtime_env_info = get_runtime_env_info(\n            runtime_env,\n            is_job_runtime_env=False,\n            serialize=True,\n        )\n\n    if _task_launch_hook:\n        _task_launch_hook(self._function_descriptor, resources, scheduling_strategy)\n\n    def invocation(args, kwargs):\n        if self._is_cross_language:\n            list_args = cross_language._format_args(worker, args, kwargs)\n        elif not args and not kwargs and not self._function_signature:\n            list_args = []\n        else:\n            list_args = ray._private.signature.flatten_args(\n                self._function_signature, args, kwargs\n            )\n\n        if worker.mode == ray._private.worker.LOCAL_MODE:\n            assert (\n                not self._is_cross_language\n            ), "Cross language remote function cannot be executed locally."\n        object_refs = worker.core_worker.submit_task(\n            self._language,\n            self._function_descriptor,\n            list_args,\n            name if name is not None else "",\n            num_returns,\n            resources,\n            max_retries,\n            retry_exceptions,\n            retry_exception_allowlist,\n            scheduling_strategy,\n            worker.debugger_breakpoint,\n            serialized_runtime_env_info or "{}",\n        )\n        # Reset worker\'s debug context from the last "remote" command\n        # (which applies only to this .remote call).\n        worker.debugger_breakpoint = b""\n        if num_returns == STREAMING_GENERATOR_RETURN:\n            # Streaming generator will return a single ref\n            # that is for the generator task.\n            assert len(object_refs) == 1\n            generator_ref = object_refs[0]\n            return StreamingObjectRefGenerator(generator_ref, worker)\n        if len(object_refs) == 1:\n            return object_refs[0]\n        elif len(object_refs) > 1:\n            return object_refs\n\n    if self._decorator is not None:\n        invocation = self._decorator(invocation)\n\n    return invocation(args, kwargs)\n',
              docstring: 'Submit the remote function for execution.',
            },
            stackframes: [
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
                lineno: 244,
                func: '_remote',
                code: '    @_tracing_task_invocation\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/tracing/tracing_helper.py',
                lineno: 306,
                func: '_invocation_remote_span',
                code: '            return method(self, args, kwargs, *_args, **_kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
                lineno: 108,
                func: '_remote',
                code: '        return super()._remote(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
                lineno: 230,
                func: 'remote',
                code: '                return func_cls._remote(args=args, kwargs=kwargs, **updated_options)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
                lineno: 98,
                func: 'wrapper',
                code: '                sfd.remote(self._run)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
                lineno: 76,
                func: 'pyu_to_spu',
                code: '    shares_chunk_count = self.device(get_shares_chunk_count)(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 80,
                func: 'dispatch',
                code: '        return self._ops[device_type][name](*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 111,
                func: 'dispatch',
                code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
                lineno: 68,
                func: 'to',
                code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
              },
              {
                filename: 'presets/millionaires/_algorithm.py',
                lineno: 29,
                func: '<module>',
                code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
              },
              {
                filename: 'Cell In[3]',
                lineno: 35,
                func: '<module>',
                code: '        exec(_algorithm, globals())\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3508,
                func: 'run_code',
                code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3448,
                func: 'run_ast_nodes',
                code: '                if await self.run_code(code, result, async_=asy):\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3269,
                func: 'run_cell_async',
                code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
                lineno: 129,
                func: '_pseudo_sync_runner',
                code: '        coro.send(None)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3064,
                func: '_run_cell',
                code: '            result = runner(coro)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3009,
                func: 'run_cell',
                code: '            result = self._run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
                lineno: 546,
                func: 'run_cell',
                code: '        return super().run_cell(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
                lineno: 422,
                func: 'do_execute',
                code: '                    res = shell.run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 740,
                func: 'execute_request',
                code: '            reply_content = await reply_content\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 412,
                func: 'dispatch_shell',
                code: '                    await result\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 505,
                func: 'process_one',
                code: '        await dispatch(*args)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 516,
                func: 'dispatch_queue',
                code: '                await self.process_one()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
                lineno: 81,
                func: '_run',
                code: '            self._context.run(self._callback, *self._args)\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 1859,
                func: '_run_once',
                code: '                handle._run()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 570,
                func: 'run_forever',
                code: '                self._run_once()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
                lineno: 195,
                func: 'start',
                code: '        self.asyncio_loop.run_forever()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
                lineno: 736,
                func: 'start',
                code: '                self.io_loop.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
                lineno: 1051,
                func: 'launch_instance',
                code: '        app.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
                lineno: 17,
                func: '<module>',
                code: '    app.launch_new_instance()\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 87,
                func: '_run_code',
                code: '    exec(code, run_globals)\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 194,
                func: '_run_module_as_main',
                code: '    return _run_code(code, main_globals, None,\n',
              },
            ],
          },
          inner_calls: [],
        },
      ],
    },
    {
      span_id: '0x200dc466cac652b8',
      start_time: '2023-10-25T09:37:49.290104',
      end_time: '2023-10-25T09:37:49.290605',
      call: {
        checkpoint: { api_level: 10 },
        snapshot: {
          kind: 'function',
          type: 'builtins.function',
          id: 'python/id/0x10b314700',
          hash: 'python/hash/0x10b31470',
          module: 'ray._private.worker',
          name: 'get',
          boundvars: {
            object_refs: {
              kind: 'object',
              type: 'ray._raylet.ObjectRef',
              id: 'ray/ObjectRef(8849b62d89cb30f9ffffffffffffffffffffffff0100000001000000)',
              hash: 'python/hash/0x58737c690b203ac',
              snapshot:
                'ObjectRef(8849b62d89cb30f9ffffffffffffffffffffffff0100000001000000)',
            },
            timeout: {
              kind: 'object',
              type: 'builtins.NoneType',
              id: 'python/id/0x1026e94f0',
              hash: 'python/hash/0x1026e94f',
              snapshot: 'None',
            },
          },
          freevars: {
            global_worker: {
              kind: 'object',
              type: 'ray._private.worker.Worker',
              id: 'python/id/0x10b2ffe20',
              hash: 'python/hash/0x10b2ffe2',
              snapshot: '<ray._private.worker.Worker object at 0x10b2ffe20>',
            },
            hasattr: {
              kind: 'object',
              type: 'builtins.builtin_function_or_method',
              id: 'python/id/0x1007789f0',
              hash: 'python/hash/0x27a154',
              snapshot: '<built-in function hasattr>',
            },
            blocking_get_inside_async_warned: {
              kind: 'object',
              type: 'builtins.bool',
              id: 'python/id/0x1026e8cd8',
              hash: 'python/hash/0x0',
              snapshot: 'False',
            },
            logger: {
              kind: 'object',
              type: 'logging.Logger',
              id: 'python/id/0x10ac641f0',
              hash: 'python/hash/0x10ac641f',
              snapshot: '<Logger ray._private.worker (INFO)>',
            },
            profiling: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x10aaecc70',
              hash: 'python/hash/0x10aaecc7',
              snapshot:
                "<module 'ray._private.profiling' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/profiling.py'>",
            },
            isinstance: {
              kind: 'object',
              type: 'builtins.builtin_function_or_method',
              id: 'python/id/0x100778b80',
              hash: 'python/hash/0x27a186',
              snapshot: '<built-in function isinstance>',
            },
            StreamingObjectRefGenerator: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x13e02ec10',
              hash: 'python/hash/0x13e02ec1',
              snapshot: "<class 'ray._raylet.StreamingObjectRefGenerator'>",
            },
            ray: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x105576ef0',
              hash: 'python/hash/0x105576ef',
              snapshot:
                "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
            },
            list: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x1026e9100',
              hash: 'python/hash/0x1026e910',
              snapshot: "<class 'list'>",
            },
            ValueError: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x10269d740',
              hash: 'python/hash/0x10269d74',
              snapshot: "<class 'ValueError'>",
            },
            enumerate: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x1026adff8',
              hash: 'python/hash/-0x7fffffffefd95201',
              snapshot: "<class 'enumerate'>",
            },
            RayError: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x13e13fd00',
              hash: 'python/hash/0x13e13fd0',
              snapshot: "<class 'ray.exceptions.RayError'>",
            },
            RayTaskError: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x13d625ff0',
              hash: 'python/hash/0x13d625ff',
              snapshot: "<class 'ray.exceptions.RayTaskError'>",
            },
            sys: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x10076cea0',
              hash: 'python/hash/0x10076cea',
              snapshot: "<module 'sys' (built-in)>",
            },
          },
          retval: {
            kind: 'object',
            type: 'builtins.int',
            id: 'python/id/0x1026f1d10',
            hash: 'python/hash/0x1',
            snapshot: '1',
          },
          filename:
            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/worker.py',
          firstlineno: 2439,
          source:
            '@PublicAPI\n@client_mode_hook\ndef get(\n    object_refs: Union[ray.ObjectRef, Sequence[ray.ObjectRef]],\n    *,\n    timeout: Optional[float] = None,\n) -> Union[Any, List[Any]]:\n    """Get a remote object or a list of remote objects from the object store.\n\n    This method blocks until the object corresponding to the object ref is\n    available in the local object store. If this object is not in the local\n    object store, it will be shipped from an object store that has it (once the\n    object has been created). If object_refs is a list, then the objects\n    corresponding to each object in the list will be returned.\n\n    Ordering for an input list of object refs is preserved for each object\n    returned. That is, if an object ref to A precedes an object ref to B in the\n    input list, then A will precede B in the returned list.\n\n    This method will issue a warning if it\'s running inside async context,\n    you can use ``await object_ref`` instead of ``ray.get(object_ref)``. For\n    a list of object refs, you can use ``await asyncio.gather(*object_refs)``.\n\n    Related patterns and anti-patterns:\n\n    - :doc:`/ray-core/patterns/ray-get-loop`\n    - :doc:`/ray-core/patterns/unnecessary-ray-get`\n    - :doc:`/ray-core/patterns/ray-get-submission-order`\n    - :doc:`/ray-core/patterns/ray-get-too-many-objects`\n\n\n    Args:\n        object_refs: Object ref of the object to get or a list of object refs\n            to get.\n        timeout (Optional[float]): The maximum amount of time in seconds to\n            wait before returning. Set this to None will block until the\n            corresponding object becomes available. Setting ``timeout=0`` will\n            return the object immediately if it\'s available, else raise\n            GetTimeoutError in accordance with the above docstring.\n\n    Returns:\n        A Python object or a list of Python objects.\n\n    Raises:\n        GetTimeoutError: A GetTimeoutError is raised if a timeout is set and\n            the get takes longer than timeout to return.\n        Exception: An exception is raised if the task that created the object\n            or that created one of the objects raised an exception.\n    """\n    worker = global_worker\n    worker.check_connected()\n\n    if hasattr(worker, "core_worker") and worker.core_worker.current_actor_is_asyncio():\n        global blocking_get_inside_async_warned\n        if not blocking_get_inside_async_warned:\n            logger.warning(\n                "Using blocking ray.get inside async actor. "\n                "This blocks the event loop. Please use `await` "\n                "on object ref with asyncio.gather if you want to "\n                "yield execution to the event loop instead."\n            )\n            blocking_get_inside_async_warned = True\n\n    with profiling.profile("ray.get"):\n        # TODO(sang): Should make StreamingObjectRefGenerator\n        # compatible to ray.get for dataset.\n        if isinstance(object_refs, StreamingObjectRefGenerator):\n            return object_refs\n\n        is_individual_id = isinstance(object_refs, ray.ObjectRef)\n        if is_individual_id:\n            object_refs = [object_refs]\n\n        if not isinstance(object_refs, list):\n            raise ValueError(\n                "\'object_refs\' must either be an ObjectRef or a list of ObjectRefs."\n            )\n\n        # TODO(ujvl): Consider how to allow user to retrieve the ready objects.\n        values, debugger_breakpoint = worker.get_objects(object_refs, timeout=timeout)\n        for i, value in enumerate(values):\n            if isinstance(value, RayError):\n                if isinstance(value, ray.exceptions.ObjectLostError):\n                    worker.core_worker.dump_object_store_memory_usage()\n                if isinstance(value, RayTaskError):\n                    raise value.as_instanceof_cause()\n                else:\n                    raise value\n\n        if is_individual_id:\n            values = values[0]\n\n        if debugger_breakpoint != b"":\n            frame = sys._getframe().f_back\n            rdb = ray.util.pdb._connect_ray_pdb(\n                host=None,\n                port=None,\n                patch_stdstreams=False,\n                quiet=None,\n                breakpoint_uuid=debugger_breakpoint.decode()\n                if debugger_breakpoint\n                else None,\n                debugger_external=worker.ray_debugger_external,\n            )\n            rdb.set_trace(frame=frame)\n\n        return values\n',
          docstring:
            "Get a remote object or a list of remote objects from the object store.\n\nThis method blocks until the object corresponding to the object ref is\navailable in the local object store. If this object is not in the local\nobject store, it will be shipped from an object store that has it (once the\nobject has been created). If object_refs is a list, then the objects\ncorresponding to each object in the list will be returned.\n\nOrdering for an input list of object refs is preserved for each object\nreturned. That is, if an object ref to A precedes an object ref to B in the\ninput list, then A will precede B in the returned list.\n\nThis method will issue a warning if it's running inside async context,\nyou can use ``await object_ref`` instead of ``ray.get(object_ref)``. For\na list of object refs, you can use ``await asyncio.gather(*object_refs)``.\n\nRelated patterns and anti-patterns:\n\n- :doc:`/ray-core/patterns/ray-get-loop`\n- :doc:`/ray-core/patterns/unnecessary-ray-get`\n- :doc:`/ray-core/patterns/ray-get-submission-order`\n- :doc:`/ray-core/patterns/ray-get-too-many-objects`\n\n\nArgs:\n    object_refs: Object ref of the object to get or a list of object refs\n        to get.\n    timeout (Optional[float]): The maximum amount of time in seconds to\n        wait before returning. Set this to None will block until the\n        corresponding object becomes available. Setting ``timeout=0`` will\n        return the object immediately if it's available, else raise\n        GetTimeoutError in accordance with the above docstring.\n\nReturns:\n    A Python object or a list of Python objects.\n\nRaises:\n    GetTimeoutError: A GetTimeoutError is raised if a timeout is set and\n        the get takes longer than timeout to return.\n    Exception: An exception is raised if the task that created the object\n        or that created one of the objects raised an exception.",
        },
        stackframes: [
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/worker.py',
            lineno: 2439,
            func: 'get',
            code: '@PublicAPI\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
            lineno: 103,
            func: 'wrapper',
            code: '        return func(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/auto_init_hook.py',
            lineno: 24,
            func: 'auto_init_wrapper',
            code: '        return fn(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
            lineno: 75,
            func: 'get',
            code: '        return ray.get(object_refs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
            lineno: 79,
            func: 'pyu_to_spu',
            code: '    shares_chunk_count = sfd.get(shares_chunk_count.data)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 80,
            func: 'dispatch',
            code: '        return self._ops[device_type][name](*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 111,
            func: 'dispatch',
            code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
            lineno: 68,
            func: 'to',
            code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
          },
          {
            filename: 'presets/millionaires/_algorithm.py',
            lineno: 29,
            func: '<module>',
            code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
          },
          {
            filename: 'Cell In[3]',
            lineno: 35,
            func: '<module>',
            code: '        exec(_algorithm, globals())\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3508,
            func: 'run_code',
            code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3448,
            func: 'run_ast_nodes',
            code: '                if await self.run_code(code, result, async_=asy):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3269,
            func: 'run_cell_async',
            code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
            lineno: 129,
            func: '_pseudo_sync_runner',
            code: '        coro.send(None)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3064,
            func: '_run_cell',
            code: '            result = runner(coro)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3009,
            func: 'run_cell',
            code: '            result = self._run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
            lineno: 546,
            func: 'run_cell',
            code: '        return super().run_cell(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
            lineno: 422,
            func: 'do_execute',
            code: '                    res = shell.run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 740,
            func: 'execute_request',
            code: '            reply_content = await reply_content\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 412,
            func: 'dispatch_shell',
            code: '                    await result\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 505,
            func: 'process_one',
            code: '        await dispatch(*args)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 516,
            func: 'dispatch_queue',
            code: '                await self.process_one()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
            lineno: 81,
            func: '_run',
            code: '            self._context.run(self._callback, *self._args)\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 1859,
            func: '_run_once',
            code: '                handle._run()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 570,
            func: 'run_forever',
            code: '                self._run_once()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
            lineno: 195,
            func: 'start',
            code: '        self.asyncio_loop.run_forever()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
            lineno: 736,
            func: 'start',
            code: '                self.io_loop.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
            lineno: 1051,
            func: 'launch_instance',
            code: '        app.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
            lineno: 17,
            func: '<module>',
            code: '    app.launch_new_instance()\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 87,
            func: '_run_code',
            code: '    exec(code, run_globals)\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 194,
            func: '_run_module_as_main',
            code: '    return _run_code(code, main_globals, None,\n',
          },
        ],
      },
      inner_calls: [],
    },
    {
      span_id: '0x7bc316b612375163',
      start_time: '2023-10-25T09:37:49.296675',
      end_time: '2023-10-25T09:37:49.298601',
      call: {
        checkpoint: { api_level: 10 },
        snapshot: {
          kind: 'function',
          type: 'builtins.function',
          id: 'python/id/0x17fcf70d0',
          hash: 'python/hash/0x17fcf70d',
          module: 'secretflow.device.device.pyu',
          name: 'PYU.__call__',
          boundvars: {
            self: {
              kind: 'remote_location',
              type: 'secretflow.device.device.pyu.PYU',
              id: 'python/id/0x335297d00',
              location: ['PYU', 'bob'],
            },
            fn: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x336b935e0',
              hash: 'python/hash/0x336b935e',
              module: 'secretflow.device.kernels.pyu',
              name: 'pyu_to_spu.<locals>.run_spu_io',
              boundvars: {
                data: { kind: 'unbound', annotation: 'typing.Any' },
                runtime_config: { kind: 'unbound', annotation: 'typing.Any' },
                world_size: { kind: 'unbound', annotation: 'typing.Any' },
                vtype: { kind: 'unbound', annotation: 'typing.Any' },
              },
              freevars: {
                SPUIO: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13e0f2130',
                  hash: 'python/hash/0x13e0f213',
                  snapshot: "<class 'secretflow.device.device.spu.SPUIO'>",
                },
              },
              retval: { kind: 'unbound', annotation: 'typing.Any' },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
              firstlineno: 71,
              source:
                'def run_spu_io(data, runtime_config, world_size, vtype):\n    io = SPUIO(runtime_config, world_size)\n    ret = io.make_shares(data, vtype)\n    return ret\n',
            },
            num_returns: {
              kind: 'object',
              type: 'builtins.int',
              id: 'python/id/0x1026f1d70',
              hash: 'python/hash/0x4',
              snapshot: '4',
            },
            kwargs: {
              kind: 'mapping',
              type: 'builtins.dict',
              id: 'python/id/0x336d09080',
              snapshot: '{}',
              values: {},
            },
          },
          freevars: {},
          retval: {
            kind: 'function',
            type: 'builtins.function',
            id: 'python/id/0x336b93280',
            hash: 'python/hash/0x336b9328',
            module: 'secretflow.device.device.pyu',
            name: 'PYU.__call__.<locals>.wrapper',
            boundvars: {
              args: { kind: 'unbound', annotation: 'typing.Any' },
              kwargs: { kind: 'unbound', annotation: 'typing.Any' },
            },
            freevars: {
              fn: {
                kind: 'function',
                type: 'builtins.function',
                id: 'python/id/0x336b935e0',
                hash: 'python/hash/0x336b935e',
                module: 'secretflow.device.kernels.pyu',
                name: 'pyu_to_spu.<locals>.run_spu_io',
                boundvars: {
                  data: { kind: 'unbound', annotation: 'typing.Any' },
                  runtime_config: { kind: 'unbound', annotation: 'typing.Any' },
                  world_size: { kind: 'unbound', annotation: 'typing.Any' },
                  vtype: { kind: 'unbound', annotation: 'typing.Any' },
                },
                freevars: {
                  SPUIO: {
                    kind: 'object',
                    type: 'builtins.type',
                    id: 'python/id/0x13e0f2130',
                    hash: 'python/hash/0x13e0f213',
                    snapshot: "<class 'secretflow.device.device.spu.SPUIO'>",
                  },
                },
                retval: { kind: 'unbound', annotation: 'typing.Any' },
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
                firstlineno: 71,
                source:
                  'def run_spu_io(data, runtime_config, world_size, vtype):\n    io = SPUIO(runtime_config, world_size)\n    ret = io.make_shares(data, vtype)\n    return ret\n',
              },
              num_returns: {
                kind: 'object',
                type: 'builtins.int',
                id: 'python/id/0x1026f1d70',
                hash: 'python/hash/0x4',
                snapshot: '4',
              },
              self: {
                kind: 'remote_location',
                type: 'secretflow.device.device.pyu.PYU',
                id: 'python/id/0x335297d00',
                location: ['PYU', 'bob'],
              },
              jax: {
                kind: 'object',
                type: 'builtins.module',
                id: 'python/id/0x10cdcfea0',
                hash: 'python/hash/0x10cdcfea',
                snapshot:
                  "<module 'jax' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/jax/__init__.py'>",
              },
              check_num_returns: {
                kind: 'function',
                type: 'builtins.function',
                id: 'python/id/0x17fcf2c10',
                hash: 'python/hash/0x17fcf2c1',
                module: 'secretflow.device.device._utils',
                name: 'check_num_returns',
                boundvars: {
                  fn: { kind: 'unbound', annotation: 'typing.Any' },
                },
                freevars: {
                  inspect: {
                    kind: 'object',
                    type: 'builtins.module',
                    id: 'python/id/0x102989270',
                    hash: 'python/hash/0x10298927',
                    snapshot:
                      "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                  },
                  hasattr: {
                    kind: 'object',
                    type: 'builtins.builtin_function_or_method',
                    id: 'python/id/0x1007789f0',
                    hash: 'python/hash/0x27a154',
                    snapshot: '<built-in function hasattr>',
                  },
                  len: {
                    kind: 'object',
                    type: 'builtins.builtin_function_or_method',
                    id: 'python/id/0x100778c70',
                    hash: 'python/hash/0x400000000027a1e0',
                    snapshot: '<built-in function len>',
                  },
                  isinstance: {
                    kind: 'object',
                    type: 'builtins.builtin_function_or_method',
                    id: 'python/id/0x100778b80',
                    hash: 'python/hash/0x27a186',
                    snapshot: '<built-in function isinstance>',
                  },
                  tuple: {
                    kind: 'object',
                    type: 'builtins.type',
                    id: 'python/id/0x1026e54a0',
                    hash: 'python/hash/0x1026e54a',
                    snapshot: "<class 'tuple'>",
                  },
                },
                retval: { kind: 'unbound', annotation: 'typing.Any' },
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/_utils.py',
                firstlineno: 4,
                source:
                  "def check_num_returns(fn):\n    # inspect.signature fails on some builtin method (e.g. numpy.random.rand).\n    # You can wrap a self define function which calls builtin function inside\n    # with return annotation to get multi returns for now.\n    if inspect.isbuiltin(fn):\n        sig = inspect.signature(lambda *arg, **kwargs: fn(*arg, **kwargs))\n    else:\n        sig = inspect.signature(fn)\n\n    if sig.return_annotation is None or sig.return_annotation == sig.empty:\n        num_returns = 1\n    else:\n        if (\n            hasattr(sig.return_annotation, '_name')\n            and sig.return_annotation._name == 'Tuple'\n        ):\n            num_returns = len(sig.return_annotation.__args__)\n        elif isinstance(sig.return_annotation, tuple):\n            num_returns = len(sig.return_annotation)\n        else:\n            num_returns = 1\n\n    return num_returns\n",
              },
              sfd: {
                kind: 'object',
                type: 'builtins.module',
                id: 'python/id/0x17fb8a450',
                hash: 'python/hash/0x17fb8a45',
                snapshot:
                  "<module 'secretflow.distributed' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/__init__.py'>",
              },
              logging: {
                kind: 'object',
                type: 'builtins.module',
                id: 'python/id/0x101987db0',
                hash: 'python/hash/0x101987db',
                snapshot:
                  "<module 'logging' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/logging/__init__.py'>",
              },
              len: {
                kind: 'object',
                type: 'builtins.builtin_function_or_method',
                id: 'python/id/0x100778c70',
                hash: 'python/hash/0x400000000027a1e0',
                snapshot: '<built-in function len>',
              },
              PYUObject: {
                kind: 'object',
                type: 'abc.ABCMeta',
                id: 'python/id/0x13e0f0320',
                hash: 'python/hash/0x13e0f032',
                snapshot: "<class 'secretflow.device.device.pyu.PYUObject'>",
              },
            },
            retval: { kind: 'unbound', annotation: 'typing.Any' },
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
            firstlineno: 83,
            source:
              "def wrapper(*args, **kwargs):\n    def try_get_data(arg, device):\n        if isinstance(arg, DeviceObject):\n            assert (\n                arg.device == device\n            ), f\"receive tensor {arg} in different device\"\n            return arg.data\n        return arg\n\n    args_, kwargs_ = jax.tree_util.tree_map(\n        lambda arg: try_get_data(arg, self), (args, kwargs)\n    )\n\n    _num_returns = check_num_returns(fn) if num_returns is None else num_returns\n    data = (\n        sfd.remote(self._run)\n        .party(self.party)\n        .options(num_returns=_num_returns)\n        .remote(fn, *args_, **kwargs_)\n    )\n    logging.debug(\n        (\n            f'PYU remote function: {fn}, num_returns={num_returns}, '\n            f'args len: {len(args)}, kwargs len: {len(kwargs)}.'\n        )\n    )\n    if _num_returns == 1:\n        return PYUObject(self, data)\n    else:\n        return [PYUObject(self, datum) for datum in data]\n",
          },
          filename:
            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
          firstlineno: 72,
          source:
            'def __call__(self, fn, *, num_returns=None, **kwargs):\n    """Set up ``fn`` for scheduling to this device.\n\n    Args:\n        func: Function to be schedule to this device.\n        num_returns: Number of returned PYUObject.\n\n    Returns:\n        A wrapped version of ``fn``, set up for device placement.\n    """\n\n    def wrapper(*args, **kwargs):\n        def try_get_data(arg, device):\n            if isinstance(arg, DeviceObject):\n                assert (\n                    arg.device == device\n                ), f"receive tensor {arg} in different device"\n                return arg.data\n            return arg\n\n        args_, kwargs_ = jax.tree_util.tree_map(\n            lambda arg: try_get_data(arg, self), (args, kwargs)\n        )\n\n        _num_returns = check_num_returns(fn) if num_returns is None else num_returns\n        data = (\n            sfd.remote(self._run)\n            .party(self.party)\n            .options(num_returns=_num_returns)\n            .remote(fn, *args_, **kwargs_)\n        )\n        logging.debug(\n            (\n                f\'PYU remote function: {fn}, num_returns={num_returns}, \'\n                f\'args len: {len(args)}, kwargs len: {len(kwargs)}.\'\n            )\n        )\n        if _num_returns == 1:\n            return PYUObject(self, data)\n        else:\n            return [PYUObject(self, datum) for datum in data]\n\n    return wrapper\n',
          docstring:
            'Set up ``fn`` for scheduling to this device.\n\nArgs:\n    func: Function to be schedule to this device.\n    num_returns: Number of returned PYUObject.\n\nReturns:\n    A wrapped version of ``fn``, set up for device placement.',
        },
        stackframes: [
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
            lineno: 72,
            func: '__call__',
            code: '    def __call__(self, fn, *, num_returns=None, **kwargs):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
            lineno: 81,
            func: 'pyu_to_spu',
            code: '    meta, io_info, *shares_chunk = self.device(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 80,
            func: 'dispatch',
            code: '        return self._ops[device_type][name](*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 111,
            func: 'dispatch',
            code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
            lineno: 68,
            func: 'to',
            code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
          },
          {
            filename: 'presets/millionaires/_algorithm.py',
            lineno: 29,
            func: '<module>',
            code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
          },
          {
            filename: 'Cell In[3]',
            lineno: 35,
            func: '<module>',
            code: '        exec(_algorithm, globals())\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3508,
            func: 'run_code',
            code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3448,
            func: 'run_ast_nodes',
            code: '                if await self.run_code(code, result, async_=asy):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3269,
            func: 'run_cell_async',
            code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
            lineno: 129,
            func: '_pseudo_sync_runner',
            code: '        coro.send(None)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3064,
            func: '_run_cell',
            code: '            result = runner(coro)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3009,
            func: 'run_cell',
            code: '            result = self._run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
            lineno: 546,
            func: 'run_cell',
            code: '        return super().run_cell(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
            lineno: 422,
            func: 'do_execute',
            code: '                    res = shell.run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 740,
            func: 'execute_request',
            code: '            reply_content = await reply_content\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 412,
            func: 'dispatch_shell',
            code: '                    await result\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 505,
            func: 'process_one',
            code: '        await dispatch(*args)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 516,
            func: 'dispatch_queue',
            code: '                await self.process_one()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
            lineno: 81,
            func: '_run',
            code: '            self._context.run(self._callback, *self._args)\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 1859,
            func: '_run_once',
            code: '                handle._run()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 570,
            func: 'run_forever',
            code: '                self._run_once()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
            lineno: 195,
            func: 'start',
            code: '        self.asyncio_loop.run_forever()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
            lineno: 736,
            func: 'start',
            code: '                self.io_loop.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
            lineno: 1051,
            func: 'launch_instance',
            code: '        app.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
            lineno: 17,
            func: '<module>',
            code: '    app.launch_new_instance()\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 87,
            func: '_run_code',
            code: '    exec(code, run_globals)\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 194,
            func: '_run_module_as_main',
            code: '    return _run_code(code, main_globals, None,\n',
          },
        ],
      },
      inner_calls: [],
    },
    {
      expression: {
        expr: 'invariant',
        semantic: 'exec',
        inputs: [
          {
            kind: 'driver',
            path: ['.0'],
            snapshot: {
              kind: 'object',
              type: 'ray._raylet.ObjectRef',
              id: 'ray/ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
              hash: 'python/hash/0x53b57d4a32661efb',
              snapshot:
                'ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
            },
          },
          {
            kind: 'driver',
            path: ['.1'],
            snapshot: {
              kind: 'object',
              type: 'libspu.spu_pb2.RuntimeConfig',
              id: 'python/id/0x29f3e3660',
              snapshot: 'protocol: SEMI2K\nfield: FM128\n',
            },
          },
          {
            kind: 'driver',
            path: ['.2'],
            snapshot: {
              kind: 'object',
              type: 'builtins.int',
              id: 'python/id/0x1026f1d30',
              hash: 'python/hash/0x2',
              snapshot: '2',
            },
          },
          {
            kind: 'driver',
            path: ['.3'],
            snapshot: {
              kind: 'object',
              type: 'builtins.int',
              id: 'python/id/0x17fa8be50',
              hash: 'python/hash/0x1',
              snapshot: '1',
            },
          },
          {
            kind: 'driver',
            path: ['(free variables)', 'SPUIO'],
            snapshot: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x13e0f2130',
              hash: 'python/hash/0x13e0f213',
              snapshot: "<class 'secretflow.device.device.spu.SPUIO'>",
            },
          },
        ],
        destination: ['PYU', 'bob'],
        outputs: [
          {
            kind: 'remote',
            path: [],
            index: 8,
            snapshot: {
              kind: 'remote_object',
              type: 'secretflow.device.device.spu.SPUObject',
              id: 'secretflow/SPU/ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000001000000)',
              location: ['SPU', 'alice', 'bob'],
            },
          },
          {
            kind: 'remote',
            path: ['.1'],
            index: 10,
            snapshot: {
              kind: 'remote_object',
              type: 'secretflow.device.device.pyu.PYUObject',
              id: 'secretflow/PYU/ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000)',
              location: ['PYU', 'bob'],
            },
          },
          {
            kind: 'remote',
            path: ['.2'],
            index: 11,
            snapshot: {
              kind: 'remote_object',
              type: 'secretflow.device.device.pyu.PYUObject',
              id: 'secretflow/PYU/ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000003000000)',
              location: ['PYU', 'bob'],
            },
          },
          {
            kind: 'remote',
            path: ['.3'],
            index: 12,
            snapshot: {
              kind: 'remote_object',
              type: 'secretflow.device.device.pyu.PYUObject',
              id: 'secretflow/PYU/ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000004000000)',
              location: ['PYU', 'bob'],
            },
          },
        ],
      },
      span_id: '0x6ac304aa93176578',
      start_time: '2023-10-25T09:37:49.305787',
      end_time: '2023-10-25T09:37:49.344828',
      call: {
        checkpoint: { api_level: 20 },
        snapshot: {
          kind: 'function',
          type: 'builtins.function',
          id: 'python/id/0x336b93280',
          hash: 'python/hash/0x336b9328',
          module: 'secretflow.device.device.pyu',
          name: 'PYU.__call__.<locals>.wrapper',
          boundvars: {
            args: {
              kind: 'sequence',
              type: 'builtins.tuple',
              id: 'python/id/0x336af8040',
              snapshot:
                '(ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000),\n protocol: SEMI2K\nfield: FM128\n,\n 2,\n 1)',
              values: [
                {
                  kind: 'object',
                  type: 'ray._raylet.ObjectRef',
                  id: 'ray/ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
                  hash: 'python/hash/0x53b57d4a32661efb',
                  snapshot:
                    'ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
                },
                {
                  kind: 'object',
                  type: 'libspu.spu_pb2.RuntimeConfig',
                  id: 'python/id/0x29f3e3660',
                  snapshot: 'protocol: SEMI2K\nfield: FM128\n',
                },
                {
                  kind: 'object',
                  type: 'builtins.int',
                  id: 'python/id/0x1026f1d30',
                  hash: 'python/hash/0x2',
                  snapshot: '2',
                },
                {
                  kind: 'object',
                  type: 'builtins.int',
                  id: 'python/id/0x17fa8be50',
                  hash: 'python/hash/0x1',
                  snapshot: '1',
                },
              ],
            },
            kwargs: {
              kind: 'mapping',
              type: 'builtins.dict',
              id: 'python/id/0x336d0a740',
              snapshot: '{}',
              values: {},
            },
          },
          freevars: {
            fn: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x336b935e0',
              hash: 'python/hash/0x336b935e',
              module: 'secretflow.device.kernels.pyu',
              name: 'pyu_to_spu.<locals>.run_spu_io',
              boundvars: {
                data: { kind: 'unbound', annotation: 'typing.Any' },
                runtime_config: { kind: 'unbound', annotation: 'typing.Any' },
                world_size: { kind: 'unbound', annotation: 'typing.Any' },
                vtype: { kind: 'unbound', annotation: 'typing.Any' },
              },
              freevars: {
                SPUIO: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13e0f2130',
                  hash: 'python/hash/0x13e0f213',
                  snapshot: "<class 'secretflow.device.device.spu.SPUIO'>",
                },
              },
              retval: { kind: 'unbound', annotation: 'typing.Any' },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
              firstlineno: 71,
              source:
                'def run_spu_io(data, runtime_config, world_size, vtype):\n    io = SPUIO(runtime_config, world_size)\n    ret = io.make_shares(data, vtype)\n    return ret\n',
            },
            num_returns: {
              kind: 'object',
              type: 'builtins.int',
              id: 'python/id/0x1026f1d70',
              hash: 'python/hash/0x4',
              snapshot: '4',
            },
            self: {
              kind: 'remote_location',
              type: 'secretflow.device.device.pyu.PYU',
              id: 'python/id/0x335297d00',
              location: ['PYU', 'bob'],
            },
            jax: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x10cdcfea0',
              hash: 'python/hash/0x10cdcfea',
              snapshot:
                "<module 'jax' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/jax/__init__.py'>",
            },
            check_num_returns: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x17fcf2c10',
              hash: 'python/hash/0x17fcf2c1',
              module: 'secretflow.device.device._utils',
              name: 'check_num_returns',
              boundvars: {
                fn: { kind: 'unbound', annotation: 'typing.Any' },
              },
              freevars: {
                inspect: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x102989270',
                  hash: 'python/hash/0x10298927',
                  snapshot:
                    "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                },
                hasattr: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x1007789f0',
                  hash: 'python/hash/0x27a154',
                  snapshot: '<built-in function hasattr>',
                },
                len: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778c70',
                  hash: 'python/hash/0x400000000027a1e0',
                  snapshot: '<built-in function len>',
                },
                isinstance: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778b80',
                  hash: 'python/hash/0x27a186',
                  snapshot: '<built-in function isinstance>',
                },
                tuple: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e54a0',
                  hash: 'python/hash/0x1026e54a',
                  snapshot: "<class 'tuple'>",
                },
              },
              retval: { kind: 'unbound', annotation: 'typing.Any' },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/_utils.py',
              firstlineno: 4,
              source:
                "def check_num_returns(fn):\n    # inspect.signature fails on some builtin method (e.g. numpy.random.rand).\n    # You can wrap a self define function which calls builtin function inside\n    # with return annotation to get multi returns for now.\n    if inspect.isbuiltin(fn):\n        sig = inspect.signature(lambda *arg, **kwargs: fn(*arg, **kwargs))\n    else:\n        sig = inspect.signature(fn)\n\n    if sig.return_annotation is None or sig.return_annotation == sig.empty:\n        num_returns = 1\n    else:\n        if (\n            hasattr(sig.return_annotation, '_name')\n            and sig.return_annotation._name == 'Tuple'\n        ):\n            num_returns = len(sig.return_annotation.__args__)\n        elif isinstance(sig.return_annotation, tuple):\n            num_returns = len(sig.return_annotation)\n        else:\n            num_returns = 1\n\n    return num_returns\n",
            },
            sfd: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x17fb8a450',
              hash: 'python/hash/0x17fb8a45',
              snapshot:
                "<module 'secretflow.distributed' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/__init__.py'>",
            },
            logging: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x101987db0',
              hash: 'python/hash/0x101987db',
              snapshot:
                "<module 'logging' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/logging/__init__.py'>",
            },
            len: {
              kind: 'object',
              type: 'builtins.builtin_function_or_method',
              id: 'python/id/0x100778c70',
              hash: 'python/hash/0x400000000027a1e0',
              snapshot: '<built-in function len>',
            },
            PYUObject: {
              kind: 'object',
              type: 'abc.ABCMeta',
              id: 'python/id/0x13e0f0320',
              hash: 'python/hash/0x13e0f032',
              snapshot: "<class 'secretflow.device.device.pyu.PYUObject'>",
            },
          },
          retval: {
            kind: 'sequence',
            type: 'builtins.list',
            id: 'python/id/0x336d33d40',
            snapshot:
              '[<secretflow.device.device.pyu.PYUObject object at 0x336badf10>,\n <secretflow.device.device.pyu.PYUObject object at 0x336d0e490>,\n <secretflow.device.device.pyu.PYUObject object at 0x336d0e9a0>,\n <secretflow.device.device.pyu.PYUObject object at 0x336d0eb50>]',
            values: [
              {
                kind: 'remote_object',
                type: 'secretflow.device.device.pyu.PYUObject',
                id: 'secretflow/PYU/ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000001000000)',
                location: ['PYU', 'bob'],
              },
              {
                kind: 'remote_object',
                type: 'secretflow.device.device.pyu.PYUObject',
                id: 'secretflow/PYU/ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000)',
                location: ['PYU', 'bob'],
              },
              {
                kind: 'remote_object',
                type: 'secretflow.device.device.pyu.PYUObject',
                id: 'secretflow/PYU/ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000003000000)',
                location: ['PYU', 'bob'],
              },
              {
                kind: 'remote_object',
                type: 'secretflow.device.device.pyu.PYUObject',
                id: 'secretflow/PYU/ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000004000000)',
                location: ['PYU', 'bob'],
              },
            ],
          },
          filename:
            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
          firstlineno: 83,
          source:
            "def wrapper(*args, **kwargs):\n    def try_get_data(arg, device):\n        if isinstance(arg, DeviceObject):\n            assert (\n                arg.device == device\n            ), f\"receive tensor {arg} in different device\"\n            return arg.data\n        return arg\n\n    args_, kwargs_ = jax.tree_util.tree_map(\n        lambda arg: try_get_data(arg, self), (args, kwargs)\n    )\n\n    _num_returns = check_num_returns(fn) if num_returns is None else num_returns\n    data = (\n        sfd.remote(self._run)\n        .party(self.party)\n        .options(num_returns=_num_returns)\n        .remote(fn, *args_, **kwargs_)\n    )\n    logging.debug(\n        (\n            f'PYU remote function: {fn}, num_returns={num_returns}, '\n            f'args len: {len(args)}, kwargs len: {len(kwargs)}.'\n        )\n    )\n    if _num_returns == 1:\n        return PYUObject(self, data)\n    else:\n        return [PYUObject(self, datum) for datum in data]\n",
        },
        stackframes: [
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
            lineno: 83,
            func: 'wrapper',
            code: '        def wrapper(*args, **kwargs):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
            lineno: 81,
            func: 'pyu_to_spu',
            code: '    meta, io_info, *shares_chunk = self.device(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 80,
            func: 'dispatch',
            code: '        return self._ops[device_type][name](*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 111,
            func: 'dispatch',
            code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
            lineno: 68,
            func: 'to',
            code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
          },
          {
            filename: 'presets/millionaires/_algorithm.py',
            lineno: 29,
            func: '<module>',
            code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
          },
          {
            filename: 'Cell In[3]',
            lineno: 35,
            func: '<module>',
            code: '        exec(_algorithm, globals())\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3508,
            func: 'run_code',
            code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3448,
            func: 'run_ast_nodes',
            code: '                if await self.run_code(code, result, async_=asy):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3269,
            func: 'run_cell_async',
            code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
            lineno: 129,
            func: '_pseudo_sync_runner',
            code: '        coro.send(None)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3064,
            func: '_run_cell',
            code: '            result = runner(coro)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3009,
            func: 'run_cell',
            code: '            result = self._run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
            lineno: 546,
            func: 'run_cell',
            code: '        return super().run_cell(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
            lineno: 422,
            func: 'do_execute',
            code: '                    res = shell.run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 740,
            func: 'execute_request',
            code: '            reply_content = await reply_content\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 412,
            func: 'dispatch_shell',
            code: '                    await result\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 505,
            func: 'process_one',
            code: '        await dispatch(*args)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 516,
            func: 'dispatch_queue',
            code: '                await self.process_one()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
            lineno: 81,
            func: '_run',
            code: '            self._context.run(self._callback, *self._args)\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 1859,
            func: '_run_once',
            code: '                handle._run()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 570,
            func: 'run_forever',
            code: '                self._run_once()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
            lineno: 195,
            func: 'start',
            code: '        self.asyncio_loop.run_forever()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
            lineno: 736,
            func: 'start',
            code: '                self.io_loop.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
            lineno: 1051,
            func: 'launch_instance',
            code: '        app.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
            lineno: 17,
            func: '<module>',
            code: '    app.launch_new_instance()\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 87,
            func: '_run_code',
            code: '    exec(code, run_globals)\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 194,
            func: '_run_module_as_main',
            code: '    return _run_code(code, main_globals, None,\n',
          },
        ],
      },
      inner_calls: [
        {
          span_id: '0x6d8dc0e3e00c85c0',
          start_time: '2023-10-25T09:37:49.312971',
          end_time: '2023-10-25T09:37:49.313874',
          call: {
            checkpoint: { api_level: 10 },
            snapshot: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10b314700',
              hash: 'python/hash/0x10b31470',
              module: 'ray._private.worker',
              name: 'get',
              boundvars: {
                object_refs: {
                  kind: 'sequence',
                  type: 'builtins.list',
                  id: 'python/id/0x336d09600',
                  snapshot:
                    '[ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)]',
                  values: [
                    {
                      kind: 'object',
                      type: 'ray._raylet.ObjectRef',
                      id: 'ray/ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
                      hash: 'python/hash/0x53b57d4a32661efb',
                      snapshot:
                        'ObjectRef(32d950ec0ccf9d2affffffffffffffffffffffff0100000001000000)',
                    },
                  ],
                },
                timeout: {
                  kind: 'object',
                  type: 'builtins.NoneType',
                  id: 'python/id/0x1026e94f0',
                  hash: 'python/hash/0x1026e94f',
                  snapshot: 'None',
                },
              },
              freevars: {
                global_worker: {
                  kind: 'object',
                  type: 'ray._private.worker.Worker',
                  id: 'python/id/0x10b2ffe20',
                  hash: 'python/hash/0x10b2ffe2',
                  snapshot: '<ray._private.worker.Worker object at 0x10b2ffe20>',
                },
                hasattr: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x1007789f0',
                  hash: 'python/hash/0x27a154',
                  snapshot: '<built-in function hasattr>',
                },
                blocking_get_inside_async_warned: {
                  kind: 'object',
                  type: 'builtins.bool',
                  id: 'python/id/0x1026e8cd8',
                  hash: 'python/hash/0x0',
                  snapshot: 'False',
                },
                logger: {
                  kind: 'object',
                  type: 'logging.Logger',
                  id: 'python/id/0x10ac641f0',
                  hash: 'python/hash/0x10ac641f',
                  snapshot: '<Logger ray._private.worker (INFO)>',
                },
                profiling: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x10aaecc70',
                  hash: 'python/hash/0x10aaecc7',
                  snapshot:
                    "<module 'ray._private.profiling' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/profiling.py'>",
                },
                isinstance: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778b80',
                  hash: 'python/hash/0x27a186',
                  snapshot: '<built-in function isinstance>',
                },
                StreamingObjectRefGenerator: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13e02ec10',
                  hash: 'python/hash/0x13e02ec1',
                  snapshot: "<class 'ray._raylet.StreamingObjectRefGenerator'>",
                },
                ray: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x105576ef0',
                  hash: 'python/hash/0x105576ef',
                  snapshot:
                    "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                },
                list: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e9100',
                  hash: 'python/hash/0x1026e910',
                  snapshot: "<class 'list'>",
                },
                ValueError: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x10269d740',
                  hash: 'python/hash/0x10269d74',
                  snapshot: "<class 'ValueError'>",
                },
                enumerate: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026adff8',
                  hash: 'python/hash/-0x7fffffffefd95201',
                  snapshot: "<class 'enumerate'>",
                },
                RayError: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13e13fd00',
                  hash: 'python/hash/0x13e13fd0',
                  snapshot: "<class 'ray.exceptions.RayError'>",
                },
                RayTaskError: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13d625ff0',
                  hash: 'python/hash/0x13d625ff',
                  snapshot: "<class 'ray.exceptions.RayTaskError'>",
                },
                sys: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x10076cea0',
                  hash: 'python/hash/0x10076cea',
                  snapshot: "<module 'sys' (built-in)>",
                },
              },
              retval: {
                kind: 'sequence',
                type: 'builtins.list',
                id: 'python/id/0x336d08100',
                snapshot: '[Array(47269504, dtype=int32)]',
                values: [
                  {
                    kind: 'object',
                    type: 'jaxlib.xla_extension.ArrayImpl',
                    id: 'python/id/0x12d5f68f0',
                    snapshot: 'Array(47269504, dtype=int32)',
                  },
                ],
              },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/worker.py',
              firstlineno: 2439,
              source:
                '@PublicAPI\n@client_mode_hook\ndef get(\n    object_refs: Union[ray.ObjectRef, Sequence[ray.ObjectRef]],\n    *,\n    timeout: Optional[float] = None,\n) -> Union[Any, List[Any]]:\n    """Get a remote object or a list of remote objects from the object store.\n\n    This method blocks until the object corresponding to the object ref is\n    available in the local object store. If this object is not in the local\n    object store, it will be shipped from an object store that has it (once the\n    object has been created). If object_refs is a list, then the objects\n    corresponding to each object in the list will be returned.\n\n    Ordering for an input list of object refs is preserved for each object\n    returned. That is, if an object ref to A precedes an object ref to B in the\n    input list, then A will precede B in the returned list.\n\n    This method will issue a warning if it\'s running inside async context,\n    you can use ``await object_ref`` instead of ``ray.get(object_ref)``. For\n    a list of object refs, you can use ``await asyncio.gather(*object_refs)``.\n\n    Related patterns and anti-patterns:\n\n    - :doc:`/ray-core/patterns/ray-get-loop`\n    - :doc:`/ray-core/patterns/unnecessary-ray-get`\n    - :doc:`/ray-core/patterns/ray-get-submission-order`\n    - :doc:`/ray-core/patterns/ray-get-too-many-objects`\n\n\n    Args:\n        object_refs: Object ref of the object to get or a list of object refs\n            to get.\n        timeout (Optional[float]): The maximum amount of time in seconds to\n            wait before returning. Set this to None will block until the\n            corresponding object becomes available. Setting ``timeout=0`` will\n            return the object immediately if it\'s available, else raise\n            GetTimeoutError in accordance with the above docstring.\n\n    Returns:\n        A Python object or a list of Python objects.\n\n    Raises:\n        GetTimeoutError: A GetTimeoutError is raised if a timeout is set and\n            the get takes longer than timeout to return.\n        Exception: An exception is raised if the task that created the object\n            or that created one of the objects raised an exception.\n    """\n    worker = global_worker\n    worker.check_connected()\n\n    if hasattr(worker, "core_worker") and worker.core_worker.current_actor_is_asyncio():\n        global blocking_get_inside_async_warned\n        if not blocking_get_inside_async_warned:\n            logger.warning(\n                "Using blocking ray.get inside async actor. "\n                "This blocks the event loop. Please use `await` "\n                "on object ref with asyncio.gather if you want to "\n                "yield execution to the event loop instead."\n            )\n            blocking_get_inside_async_warned = True\n\n    with profiling.profile("ray.get"):\n        # TODO(sang): Should make StreamingObjectRefGenerator\n        # compatible to ray.get for dataset.\n        if isinstance(object_refs, StreamingObjectRefGenerator):\n            return object_refs\n\n        is_individual_id = isinstance(object_refs, ray.ObjectRef)\n        if is_individual_id:\n            object_refs = [object_refs]\n\n        if not isinstance(object_refs, list):\n            raise ValueError(\n                "\'object_refs\' must either be an ObjectRef or a list of ObjectRefs."\n            )\n\n        # TODO(ujvl): Consider how to allow user to retrieve the ready objects.\n        values, debugger_breakpoint = worker.get_objects(object_refs, timeout=timeout)\n        for i, value in enumerate(values):\n            if isinstance(value, RayError):\n                if isinstance(value, ray.exceptions.ObjectLostError):\n                    worker.core_worker.dump_object_store_memory_usage()\n                if isinstance(value, RayTaskError):\n                    raise value.as_instanceof_cause()\n                else:\n                    raise value\n\n        if is_individual_id:\n            values = values[0]\n\n        if debugger_breakpoint != b"":\n            frame = sys._getframe().f_back\n            rdb = ray.util.pdb._connect_ray_pdb(\n                host=None,\n                port=None,\n                patch_stdstreams=False,\n                quiet=None,\n                breakpoint_uuid=debugger_breakpoint.decode()\n                if debugger_breakpoint\n                else None,\n                debugger_external=worker.ray_debugger_external,\n            )\n            rdb.set_trace(frame=frame)\n\n        return values\n',
              docstring:
                "Get a remote object or a list of remote objects from the object store.\n\nThis method blocks until the object corresponding to the object ref is\navailable in the local object store. If this object is not in the local\nobject store, it will be shipped from an object store that has it (once the\nobject has been created). If object_refs is a list, then the objects\ncorresponding to each object in the list will be returned.\n\nOrdering for an input list of object refs is preserved for each object\nreturned. That is, if an object ref to A precedes an object ref to B in the\ninput list, then A will precede B in the returned list.\n\nThis method will issue a warning if it's running inside async context,\nyou can use ``await object_ref`` instead of ``ray.get(object_ref)``. For\na list of object refs, you can use ``await asyncio.gather(*object_refs)``.\n\nRelated patterns and anti-patterns:\n\n- :doc:`/ray-core/patterns/ray-get-loop`\n- :doc:`/ray-core/patterns/unnecessary-ray-get`\n- :doc:`/ray-core/patterns/ray-get-submission-order`\n- :doc:`/ray-core/patterns/ray-get-too-many-objects`\n\n\nArgs:\n    object_refs: Object ref of the object to get or a list of object refs\n        to get.\n    timeout (Optional[float]): The maximum amount of time in seconds to\n        wait before returning. Set this to None will block until the\n        corresponding object becomes available. Setting ``timeout=0`` will\n        return the object immediately if it's available, else raise\n        GetTimeoutError in accordance with the above docstring.\n\nReturns:\n    A Python object or a list of Python objects.\n\nRaises:\n    GetTimeoutError: A GetTimeoutError is raised if a timeout is set and\n        the get takes longer than timeout to return.\n    Exception: An exception is raised if the task that created the object\n        or that created one of the objects raised an exception.",
            },
            stackframes: [
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/worker.py',
                lineno: 2439,
                func: 'get',
                code: '@PublicAPI\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                lineno: 103,
                func: 'wrapper',
                code: '        return func(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/auto_init_hook.py',
                lineno: 24,
                func: 'auto_init_wrapper',
                code: '        return fn(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
                lineno: 97,
                func: '_resolve_args',
                code: '    actual_vals = ray.get(list(refs.values()))\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
                lineno: 107,
                func: '_remote',
                code: '        args, kwargs = _resolve_args(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
                lineno: 230,
                func: 'remote',
                code: '                return func_cls._remote(args=args, kwargs=kwargs, **updated_options)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
                lineno: 98,
                func: 'wrapper',
                code: '                sfd.remote(self._run)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
                lineno: 81,
                func: 'pyu_to_spu',
                code: '    meta, io_info, *shares_chunk = self.device(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 80,
                func: 'dispatch',
                code: '        return self._ops[device_type][name](*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 111,
                func: 'dispatch',
                code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
                lineno: 68,
                func: 'to',
                code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
              },
              {
                filename: 'presets/millionaires/_algorithm.py',
                lineno: 29,
                func: '<module>',
                code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
              },
              {
                filename: 'Cell In[3]',
                lineno: 35,
                func: '<module>',
                code: '        exec(_algorithm, globals())\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3508,
                func: 'run_code',
                code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3448,
                func: 'run_ast_nodes',
                code: '                if await self.run_code(code, result, async_=asy):\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3269,
                func: 'run_cell_async',
                code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
                lineno: 129,
                func: '_pseudo_sync_runner',
                code: '        coro.send(None)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3064,
                func: '_run_cell',
                code: '            result = runner(coro)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3009,
                func: 'run_cell',
                code: '            result = self._run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
                lineno: 546,
                func: 'run_cell',
                code: '        return super().run_cell(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
                lineno: 422,
                func: 'do_execute',
                code: '                    res = shell.run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 740,
                func: 'execute_request',
                code: '            reply_content = await reply_content\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 412,
                func: 'dispatch_shell',
                code: '                    await result\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 505,
                func: 'process_one',
                code: '        await dispatch(*args)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 516,
                func: 'dispatch_queue',
                code: '                await self.process_one()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
                lineno: 81,
                func: '_run',
                code: '            self._context.run(self._callback, *self._args)\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 1859,
                func: '_run_once',
                code: '                handle._run()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 570,
                func: 'run_forever',
                code: '                self._run_once()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
                lineno: 195,
                func: 'start',
                code: '        self.asyncio_loop.run_forever()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
                lineno: 736,
                func: 'start',
                code: '                self.io_loop.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
                lineno: 1051,
                func: 'launch_instance',
                code: '        app.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
                lineno: 17,
                func: '<module>',
                code: '    app.launch_new_instance()\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 87,
                func: '_run_code',
                code: '    exec(code, run_globals)\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 194,
                func: '_run_module_as_main',
                code: '    return _run_code(code, main_globals, None,\n',
              },
            ],
          },
          inner_calls: [],
        },
        {
          span_id: '0x38997ce3aa2f3eb5',
          start_time: '2023-10-25T09:37:49.335693',
          end_time: '2023-10-25T09:37:49.341972',
          call: {
            checkpoint: { api_level: 10 },
            snapshot: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10b2c2c10',
              hash: 'python/hash/0x10b2c2c1',
              module: 'ray.remote_function',
              name: 'RemoteFunction._remote',
              boundvars: {
                self: {
                  kind: 'object',
                  type: 'secretflow.distributed.primitive.RemoteFunctionWrapper',
                  id: 'python/id/0x336bb6fd0',
                  hash: 'python/hash/0x336bb6fd',
                  snapshot:
                    '<secretflow.distributed.primitive.RemoteFunctionWrapper object at 0x336bb6fd0>',
                },
                args: {
                  kind: 'sequence',
                  type: 'builtins.tuple',
                  id: 'python/id/0x3352baae0',
                  snapshot:
                    '(<function pyu_to_spu.<locals>.run_spu_io at 0x336b935e0>,\n Array(47269504, dtype=int32),\n protocol: SEMI2K\nfield: FM128\n,\n 2,\n 1)',
                  values: [
                    {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x336b935e0',
                      hash: 'python/hash/0x336b935e',
                      module: 'secretflow.device.kernels.pyu',
                      name: 'pyu_to_spu.<locals>.run_spu_io',
                      boundvars: {
                        data: { kind: 'unbound', annotation: 'typing.Any' },
                        runtime_config: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        world_size: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        vtype: { kind: 'unbound', annotation: 'typing.Any' },
                      },
                      freevars: {
                        SPUIO: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x13e0f2130',
                          hash: 'python/hash/0x13e0f213',
                          snapshot: "<class 'secretflow.device.device.spu.SPUIO'>",
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'typing.Any' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
                      firstlineno: 71,
                      source:
                        'def run_spu_io(data, runtime_config, world_size, vtype):\n    io = SPUIO(runtime_config, world_size)\n    ret = io.make_shares(data, vtype)\n    return ret\n',
                    },
                    {
                      kind: 'object',
                      type: 'jaxlib.xla_extension.ArrayImpl',
                      id: 'python/id/0x12d5f68f0',
                      snapshot: 'Array(47269504, dtype=int32)',
                    },
                    {
                      kind: 'object',
                      type: 'libspu.spu_pb2.RuntimeConfig',
                      id: 'python/id/0x29f3e3660',
                      snapshot: 'protocol: SEMI2K\nfield: FM128\n',
                    },
                    {
                      kind: 'object',
                      type: 'builtins.int',
                      id: 'python/id/0x1026f1d30',
                      hash: 'python/hash/0x2',
                      snapshot: '2',
                    },
                    {
                      kind: 'object',
                      type: 'builtins.int',
                      id: 'python/id/0x17fa8be50',
                      hash: 'python/hash/0x1',
                      snapshot: '1',
                    },
                  ],
                },
                kwargs: {
                  kind: 'mapping',
                  type: 'builtins.dict',
                  id: 'python/id/0x2b2ccad40',
                  snapshot: '{}',
                  values: {},
                },
                task_options: {
                  kind: 'mapping',
                  type: 'builtins.dict',
                  id: 'python/id/0x334fd8300',
                  snapshot: "{'num_returns': 4, 'resources': {'bob': 1}}",
                  values: {
                    num_returns: {
                      kind: 'object',
                      type: 'builtins.int',
                      id: 'python/id/0x1026f1d70',
                      hash: 'python/hash/0x4',
                      snapshot: '4',
                    },
                    resources: {
                      kind: 'mapping',
                      type: 'builtins.dict',
                      id: 'python/id/0x336ba4e80',
                      snapshot: "{'bob': 1}",
                      values: {
                        bob: {
                          kind: 'object',
                          type: 'builtins.int',
                          id: 'python/id/0x1026f1d10',
                          hash: 'python/hash/0x1',
                          snapshot: '1',
                        },
                      },
                    },
                  },
                },
              },
              freevars: {
                auto_init_ray: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10a9629d0',
                  hash: 'python/hash/0x10a9629d',
                  module: 'ray._private.auto_init_hook',
                  name: 'auto_init_ray',
                  boundvars: {},
                  freevars: {
                    os: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x100826590',
                      hash: 'python/hash/0x10082659',
                      snapshot:
                        "<module 'os' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/os.py'>",
                    },
                    ray: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x105576ef0',
                      hash: 'python/hash/0x105576ef',
                      snapshot:
                        "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                    },
                    auto_init_lock: {
                      kind: 'object',
                      type: '_thread.lock',
                      id: 'python/id/0x10a9619f0',
                      hash: 'python/hash/0x10a9619f',
                      snapshot: '<unlocked _thread.lock object at 0x10a9619f0>',
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/auto_init_hook.py',
                  firstlineno: 9,
                  source:
                    'def auto_init_ray():\n    if (\n        os.environ.get("RAY_ENABLE_AUTO_CONNECT", "") != "0"\n        and not ray.is_initialized()\n    ):\n        auto_init_lock.acquire()\n        if not ray.is_initialized():\n            ray.init()\n        auto_init_lock.release()\n',
                },
                client_mode_should_convert: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10a9650d0',
                  hash: 'python/hash/0x10a9650d',
                  module: 'ray._private.client_mode_hook',
                  name: 'client_mode_should_convert',
                  boundvars: {},
                  freevars: {
                    is_client_mode_enabled: {
                      kind: 'object',
                      type: 'builtins.bool',
                      id: 'python/id/0x1026e8cd8',
                      hash: 'python/hash/0x0',
                      snapshot: 'False',
                    },
                    is_client_mode_enabled_by_default: {
                      kind: 'object',
                      type: 'builtins.bool',
                      id: 'python/id/0x1026e8cd8',
                      hash: 'python/hash/0x0',
                      snapshot: 'False',
                    },
                    _get_client_hook_status_on_thread: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10a962940',
                      hash: 'python/hash/0x10a96294',
                      module: 'ray._private.client_mode_hook',
                      name: '_get_client_hook_status_on_thread',
                      boundvars: {},
                      freevars: {
                        hasattr: {
                          kind: 'object',
                          type: 'builtins.builtin_function_or_method',
                          id: 'python/id/0x1007789f0',
                          hash: 'python/hash/0x27a154',
                          snapshot: '<built-in function hasattr>',
                        },
                        _client_hook_status_on_thread: {
                          kind: 'object',
                          type: '_thread._local',
                          id: 'python/id/0x10a9608b0',
                          hash: 'python/hash/0x10a9608b',
                          snapshot: '<_thread._local object at 0x10a9608b0>',
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'typing.Any' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                      firstlineno: 27,
                      source:
                        'def _get_client_hook_status_on_thread():\n    """Get\'s the value of `_client_hook_status_on_thread`.\n    Since `_client_hook_status_on_thread` is a thread-local variable, we may\n    need to add and set the \'status\' attribute.\n    """\n    global _client_hook_status_on_thread\n    if not hasattr(_client_hook_status_on_thread, "status"):\n        _client_hook_status_on_thread.status = True\n    return _client_hook_status_on_thread.status\n',
                      docstring:
                        "Get's the value of `_client_hook_status_on_thread`.\nSince `_client_hook_status_on_thread` is a thread-local variable, we may\nneed to add and set the 'status' attribute.",
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                  firstlineno: 108,
                  source:
                    'def client_mode_should_convert():\n    """Determines if functions should be converted to client mode."""\n\n    # `is_client_mode_enabled_by_default` is used for testing with\n    # `RAY_CLIENT_MODE=1`. This flag means all tests run with client mode.\n    return (\n        is_client_mode_enabled or is_client_mode_enabled_by_default\n    ) and _get_client_hook_status_on_thread()\n',
                  docstring:
                    'Determines if functions should be converted to client mode.',
                },
                client_mode_convert_function: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10a9651f0',
                  hash: 'python/hash/0x10a9651f',
                  module: 'ray._private.client_mode_hook',
                  name: 'client_mode_convert_function',
                  boundvars: {
                    func_cls: { kind: 'unbound', annotation: 'typing.Any' },
                    in_args: { kind: 'unbound', annotation: 'typing.Any' },
                    in_kwargs: { kind: 'unbound', annotation: 'typing.Any' },
                    kwargs: { kind: 'unbound', annotation: 'typing.Any' },
                  },
                  freevars: {
                    getattr: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x100778950',
                      hash: 'python/hash/0x400000000027a162',
                      snapshot: '<built-in function getattr>',
                    },
                    RAY_CLIENT_MODE_ATTR: {
                      kind: 'object',
                      type: 'builtins.str',
                      id: 'python/id/0x10a960260',
                      hash: 'python/hash/-0x4a78f7bc06cfd03c',
                      snapshot: "'__ray_client_mode_key__'",
                    },
                    setattr: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x10077a040',
                      hash: 'python/hash/-0x3fffffffffd85c5f',
                      snapshot: '<built-in function setattr>',
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                  firstlineno: 146,
                  source:
                    'def client_mode_convert_function(func_cls, in_args, in_kwargs, **kwargs):\n    """Runs a preregistered ray RemoteFunction through the ray client.\n\n    The common case for this is to transparently convert that RemoteFunction\n    to a ClientRemoteFunction. This happens in circumstances where the\n    RemoteFunction is declared early, in a library and only then is Ray used in\n    client mode -- necessitating a conversion.\n    """\n    from ray.util.client import ray\n\n    key = getattr(func_cls, RAY_CLIENT_MODE_ATTR, None)\n\n    # Second part of "or" is needed in case func_cls is reused between Ray\n    # client sessions in one Python interpreter session.\n    if (key is None) or (not ray._converted_key_exists(key)):\n        key = ray._convert_function(func_cls)\n        setattr(func_cls, RAY_CLIENT_MODE_ATTR, key)\n    client_func = ray._get_converted(key)\n    return client_func._remote(in_args, in_kwargs, **kwargs)\n',
                  docstring:
                    'Runs a preregistered ray RemoteFunction through the ray client.\n\nThe common case for this is to transparently convert that RemoteFunction\nto a ClientRemoteFunction. This happens in circumstances where the\nRemoteFunction is declared early, in a library and only then is Ray used in\nclient mode -- necessitating a conversion.',
                },
                ray: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x105576ef0',
                  hash: 'python/hash/0x105576ef',
                  snapshot:
                    "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                },
                PythonFunctionDescriptor: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x128e110d8',
                  hash: 'python/hash/-0x7fffffffed71eef3',
                  snapshot: "<class 'ray._raylet.PythonFunctionDescriptor'>",
                },
                pickle_dumps: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10adec0d0',
                  hash: 'python/hash/0x10adec0d',
                  module: 'ray._private.serialization',
                  name: 'pickle_dumps',
                  boundvars: {
                    obj: { kind: 'unbound', annotation: 'typing.Any' },
                    error_msg: { kind: 'unbound', annotation: "<class 'str'>" },
                  },
                  freevars: {
                    pickle: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x10565a8b0',
                      hash: 'python/hash/0x10565a8b',
                      snapshot:
                        "<module 'ray.cloudpickle' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/cloudpickle/__init__.py'>",
                    },
                    TypeError: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x102699ab0',
                      hash: 'python/hash/0x102699ab',
                      snapshot: "<class 'TypeError'>",
                    },
                    io: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x1008129f0',
                      hash: 'python/hash/0x1008129f',
                      snapshot:
                        "<module 'io' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/io.py'>",
                    },
                    inspect_serializability: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aad4670',
                      hash: 'python/hash/0x10aad467',
                      module: 'ray.util.check_serialize',
                      name: 'inspect_serializability',
                      boundvars: {
                        base_obj: { kind: 'unbound', annotation: 'typing.Any' },
                        name: {
                          kind: 'object',
                          type: 'builtins.NoneType',
                          id: 'python/id/0x1026e94f0',
                          hash: 'python/hash/0x1026e94f',
                          snapshot: 'None',
                        },
                        depth: {
                          kind: 'object',
                          type: 'builtins.int',
                          id: 'python/id/0x1026f1d50',
                          hash: 'python/hash/0x3',
                          snapshot: '3',
                        },
                        print_file: {
                          kind: 'object',
                          type: 'builtins.NoneType',
                          id: 'python/id/0x1026e94f0',
                          hash: 'python/hash/0x1026e94f',
                          snapshot: 'None',
                        },
                      },
                      freevars: {
                        _Printer: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x13e13e220',
                          hash: 'python/hash/0x13e13e22',
                          snapshot: "<class 'ray.util.check_serialize._Printer'>",
                        },
                        _inspect_serializability: {
                          kind: 'function',
                          type: 'builtins.function',
                          id: 'python/id/0x10aad4700',
                          hash: 'python/hash/0x10aad470',
                          module: 'ray.util.check_serialize',
                          name: '_inspect_serializability',
                          boundvars: {
                            base_obj: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            name: { kind: 'unbound', annotation: 'typing.Any' },
                            depth: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            parent: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            failure_set: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            printer: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                          },
                          freevars: {
                            colorama: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x105641720',
                              hash: 'python/hash/0x10564172',
                              snapshot:
                                "<module 'colorama' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/thirdparty_files/colorama/__init__.py'>",
                            },
                            set: {
                              kind: 'object',
                              type: 'builtins.type',
                              id: 'python/id/0x1026c9cb8',
                              hash: 'python/hash/-0x7fffffffefd93635',
                              snapshot: "<class 'set'>",
                            },
                            min: {
                              kind: 'object',
                              type: 'builtins.builtin_function_or_method',
                              id: 'python/id/0x100778d60',
                              hash: 'python/hash/0x400000000027a242',
                              snapshot: '<built-in function min>',
                            },
                            len: {
                              kind: 'object',
                              type: 'builtins.builtin_function_or_method',
                              id: 'python/id/0x100778c70',
                              hash: 'python/hash/0x400000000027a1e0',
                              snapshot: '<built-in function len>',
                            },
                            str: {
                              kind: 'object',
                              type: 'builtins.type',
                              id: 'python/id/0x1026e5300',
                              hash: 'python/hash/0x1026e530',
                              snapshot: "<class 'str'>",
                            },
                            cp: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x10565a8b0',
                              hash: 'python/hash/0x10565a8b',
                              snapshot:
                                "<module 'ray.cloudpickle' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/cloudpickle/__init__.py'>",
                            },
                            Exception: {
                              kind: 'object',
                              type: 'builtins.type',
                              id: 'python/id/0x102699910',
                              hash: 'python/hash/0x10269991',
                              snapshot: "<class 'Exception'>",
                            },
                            FailureTuple: {
                              kind: 'object',
                              type: 'builtins.type',
                              id: 'python/id/0x13e13e700',
                              hash: 'python/hash/0x13e13e70',
                              snapshot:
                                "<class 'ray.util.check_serialize.FailureTuple'>",
                            },
                            inspect: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x102989270',
                              hash: 'python/hash/0x10298927',
                              snapshot:
                                "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                            },
                            _inspect_func_serialization: {
                              kind: 'function',
                              type: 'builtins.function',
                              id: 'python/id/0x10aad4280',
                              hash: 'python/hash/0x10aad428',
                              module: 'ray.util.check_serialize',
                              name: '_inspect_func_serialization',
                              boundvars: {
                                base_obj: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                depth: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                parent: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                failure_set: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                printer: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                              },
                              freevars: {
                                inspect: {
                                  kind: 'object',
                                  type: 'builtins.module',
                                  id: 'python/id/0x102989270',
                                  hash: 'python/hash/0x10298927',
                                  snapshot:
                                    "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                                },
                                AssertionError: {
                                  kind: 'object',
                                  type: 'builtins.type',
                                  id: 'python/id/0x10269df60',
                                  hash: 'python/hash/0x10269df6',
                                  snapshot: "<class 'AssertionError'>",
                                },
                                len: {
                                  kind: 'object',
                                  type: 'builtins.builtin_function_or_method',
                                  id: 'python/id/0x100778c70',
                                  hash: 'python/hash/0x400000000027a1e0',
                                  snapshot: '<built-in function len>',
                                },
                                _inspect_serializability: {
                                  kind: 'ref',
                                  id: 'python/id/0x10aad4700',
                                },
                              },
                              retval: {
                                kind: 'unbound',
                                annotation: 'typing.Any',
                              },
                              filename:
                                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                              firstlineno: 52,
                              source:
                                'def _inspect_func_serialization(base_obj, depth, parent, failure_set, printer):\n    """Adds the first-found non-serializable element to the failure_set."""\n    assert inspect.isfunction(base_obj)\n    closure = inspect.getclosurevars(base_obj)\n    found = False\n    if closure.globals:\n        printer.print(\n            f"Detected {len(closure.globals)} global variables. "\n            "Checking serializability..."\n        )\n\n        with printer.indent():\n            for name, obj in closure.globals.items():\n                serializable, _ = _inspect_serializability(\n                    obj,\n                    name=name,\n                    depth=depth - 1,\n                    parent=parent,\n                    failure_set=failure_set,\n                    printer=printer,\n                )\n                found = found or not serializable\n                if found:\n                    break\n\n    if closure.nonlocals:\n        printer.print(\n            f"Detected {len(closure.nonlocals)} nonlocal variables. "\n            "Checking serializability..."\n        )\n        with printer.indent():\n            for name, obj in closure.nonlocals.items():\n                serializable, _ = _inspect_serializability(\n                    obj,\n                    name=name,\n                    depth=depth - 1,\n                    parent=parent,\n                    failure_set=failure_set,\n                    printer=printer,\n                )\n                found = found or not serializable\n                if found:\n                    break\n    if not found:\n        printer.print(\n            f"WARNING: Did not find non-serializable object in {base_obj}. "\n            "This may be an oversight."\n        )\n    return found\n',
                              docstring:
                                'Adds the first-found non-serializable element to the failure_set.',
                            },
                            _inspect_generic_serialization: {
                              kind: 'function',
                              type: 'builtins.function',
                              id: 'python/id/0x10aad45e0',
                              hash: 'python/hash/0x10aad45e',
                              module: 'ray.util.check_serialize',
                              name: '_inspect_generic_serialization',
                              boundvars: {
                                base_obj: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                depth: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                parent: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                failure_set: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                                printer: {
                                  kind: 'unbound',
                                  annotation: 'typing.Any',
                                },
                              },
                              freevars: {
                                inspect: {
                                  kind: 'object',
                                  type: 'builtins.module',
                                  id: 'python/id/0x102989270',
                                  hash: 'python/hash/0x10298927',
                                  snapshot:
                                    "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                                },
                                AssertionError: {
                                  kind: 'object',
                                  type: 'builtins.type',
                                  id: 'python/id/0x10269df60',
                                  hash: 'python/hash/0x10269df6',
                                  snapshot: "<class 'AssertionError'>",
                                },
                                _inspect_serializability: {
                                  kind: 'ref',
                                  id: 'python/id/0x10aad4700',
                                },
                              },
                              retval: {
                                kind: 'unbound',
                                annotation: 'typing.Any',
                              },
                              filename:
                                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                              firstlineno: 103,
                              source:
                                'def _inspect_generic_serialization(base_obj, depth, parent, failure_set, printer):\n    """Adds the first-found non-serializable element to the failure_set."""\n    assert not inspect.isfunction(base_obj)\n    functions = inspect.getmembers(base_obj, predicate=inspect.isfunction)\n    found = False\n    with printer.indent():\n        for name, obj in functions:\n            serializable, _ = _inspect_serializability(\n                obj,\n                name=name,\n                depth=depth - 1,\n                parent=parent,\n                failure_set=failure_set,\n                printer=printer,\n            )\n            found = found or not serializable\n            if found:\n                break\n\n    with printer.indent():\n        members = inspect.getmembers(base_obj)\n        for name, obj in members:\n            if name.startswith("__") and name.endswith("__") or inspect.isbuiltin(obj):\n                continue\n            serializable, _ = _inspect_serializability(\n                obj,\n                name=name,\n                depth=depth - 1,\n                parent=parent,\n                failure_set=failure_set,\n                printer=printer,\n            )\n            found = found or not serializable\n            if found:\n                break\n    if not found:\n        printer.print(\n            f"WARNING: Did not find non-serializable object in {base_obj}. "\n            "This may be an oversight."\n        )\n    return found\n',
                              docstring:
                                'Adds the first-found non-serializable element to the failure_set.',
                            },
                          },
                          retval: {
                            kind: 'unbound',
                            annotation:
                              'typing.Tuple[bool, typing.Set[ray.util.check_serialize.FailureTuple]]',
                          },
                          filename:
                            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                          firstlineno: 172,
                          source:
                            'def _inspect_serializability(\n    base_obj, name, depth, parent, failure_set, printer\n) -> Tuple[bool, Set[FailureTuple]]:\n    colorama.init()\n    top_level = False\n    declaration = ""\n    found = False\n    if failure_set is None:\n        top_level = True\n        failure_set = set()\n        declaration = f"Checking Serializability of {base_obj}"\n        printer.print("=" * min(len(declaration), 80))\n        printer.print(declaration)\n        printer.print("=" * min(len(declaration), 80))\n\n        if name is None:\n            name = str(base_obj)\n    else:\n        printer.print(f"Serializing \'{name}\' {base_obj}...")\n    try:\n        cp.dumps(base_obj)\n        return True, failure_set\n    except Exception as e:\n        printer.print(\n            f"{colorama.Fore.RED}!!! FAIL{colorama.Fore.RESET} " f"serialization: {e}"\n        )\n        found = True\n        try:\n            if depth == 0:\n                failure_set.add(FailureTuple(base_obj, name, parent))\n        # Some objects may not be hashable, so we skip adding this to the set.\n        except Exception:\n            pass\n\n    if depth <= 0:\n        return False, failure_set\n\n    # TODO: we only differentiate between \'function\' and \'object\'\n    # but we should do a better job of diving into something\n    # more specific like a Type, Object, etc.\n    if inspect.isfunction(base_obj):\n        _inspect_func_serialization(\n            base_obj,\n            depth=depth,\n            parent=base_obj,\n            failure_set=failure_set,\n            printer=printer,\n        )\n    else:\n        _inspect_generic_serialization(\n            base_obj,\n            depth=depth,\n            parent=base_obj,\n            failure_set=failure_set,\n            printer=printer,\n        )\n\n    if not failure_set:\n        failure_set.add(FailureTuple(base_obj, name, parent))\n\n    if top_level:\n        printer.print("=" * min(len(declaration), 80))\n        if not failure_set:\n            printer.print(\n                "Nothing failed the inspect_serialization test, though "\n                "serialization did not succeed."\n            )\n        else:\n            fail_vars = (\n                f"\\n\\n\\t{colorama.Style.BRIGHT}"\n                + "\\n".join(str(k) for k in failure_set)\n                + f"{colorama.Style.RESET_ALL}\\n\\n"\n            )\n            printer.print(\n                f"Variable: {fail_vars}was found to be non-serializable. "\n                "There may be multiple other undetected variables that were "\n                "non-serializable. "\n            )\n            printer.print(\n                "Consider either removing the "\n                "instantiation/imports of these variables or moving the "\n                "instantiation into the scope of the function/class. "\n            )\n        printer.print("=" * min(len(declaration), 80))\n        printer.print(\n            "Check https://docs.ray.io/en/master/ray-core/objects/serialization.html#troubleshooting for more information."  # noqa\n        )\n        printer.print(\n            "If you have any suggestions on how to improve "\n            "this error message, please reach out to the "\n            "Ray developers on github.com/ray-project/ray/issues/"\n        )\n        printer.print("=" * min(len(declaration), 80))\n    return not found, failure_set\n',
                        },
                      },
                      retval: {
                        kind: 'unbound',
                        annotation:
                          'typing.Tuple[bool, typing.Set[ray.util.check_serialize.FailureTuple]]',
                      },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                      firstlineno: 146,
                      source:
                        '@DeveloperAPI\ndef inspect_serializability(\n    base_obj: Any,\n    name: Optional[str] = None,\n    depth: int = 3,\n    print_file: Optional[Any] = None,\n) -> Tuple[bool, Set[FailureTuple]]:\n    """Identifies what objects are preventing serialization.\n\n    Args:\n        base_obj: Object to be serialized.\n        name: Optional name of string.\n        depth: Depth of the scope stack to walk through. Defaults to 3.\n        print_file: file argument that will be passed to print().\n\n    Returns:\n        bool: True if serializable.\n        set[FailureTuple]: Set of unserializable objects.\n\n    .. versionadded:: 1.1.0\n\n    """\n    printer = _Printer(print_file)\n    return _inspect_serializability(base_obj, name, depth, None, None, printer)\n',
                      docstring:
                        'Identifies what objects are preventing serialization.\n\nArgs:\n    base_obj: Object to be serialized.\n    name: Optional name of string.\n    depth: Depth of the scope stack to walk through. Defaults to 3.\n    print_file: file argument that will be passed to print().\n\nReturns:\n    bool: True if serializable.\n    set[FailureTuple]: Set of unserializable objects.\n\n.. versionadded:: 1.1.0\n\n**DeveloperAPI:** This API may change across minor Ray releases.',
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/serialization.py',
                  firstlineno: 58,
                  source:
                    'def pickle_dumps(obj: Any, error_msg: str):\n    """Wrap cloudpickle.dumps to provide better error message\n    when the object is not serializable.\n    """\n    try:\n        return pickle.dumps(obj)\n    except TypeError as e:\n        sio = io.StringIO()\n        inspect_serializability(obj, print_file=sio)\n        msg = f"{error_msg}:\\n{sio.getvalue()}"\n        raise TypeError(msg) from e\n',
                  docstring:
                    'Wrap cloudpickle.dumps to provide better error message\nwhen the object is not serializable.',
                },
                ray_option_utils: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x10aa843b0',
                  hash: 'python/hash/0x10aa843b',
                  snapshot:
                    "<module 'ray._private.ray_option_utils' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/ray_option_utils.py'>",
                },
                os: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x100826590',
                  hash: 'python/hash/0x10082659',
                  snapshot:
                    "<module 'os' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/os.py'>",
                },
                int: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e5160',
                  hash: 'python/hash/0x1026e516',
                  snapshot: "<class 'int'>",
                },
                parse_runtime_env: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aab65e0',
                  hash: 'python/hash/0x10aab65e',
                  module: 'ray._private.utils',
                  name: 'parse_runtime_env',
                  boundvars: {
                    runtime_env: {
                      kind: 'unbound',
                      annotation:
                        "typing.Union[typing.Dict, ForwardRef('RuntimeEnv'), NoneType]",
                    },
                  },
                  freevars: {
                    isinstance: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x100778b80',
                      hash: 'python/hash/0x27a186',
                      snapshot: '<built-in function isinstance>',
                    },
                    dict: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x1026e8dc0',
                      hash: 'python/hash/0x1026e8dc',
                      snapshot: "<class 'dict'>",
                    },
                    TypeError: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x102699ab0',
                      hash: 'python/hash/0x102699ab',
                      snapshot: "<class 'TypeError'>",
                    },
                    type: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x1026e8698',
                      hash: 'python/hash/-0x7fffffffefd91797',
                      snapshot: "<class 'type'>",
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/utils.py',
                  firstlineno: 1599,
                  source:
                    'def parse_runtime_env(runtime_env: Optional[Union[Dict, "RuntimeEnv"]]):\n    from ray.runtime_env import RuntimeEnv\n\n    # Parse local pip/conda config files here. If we instead did it in\n    # .remote(), it would get run in the Ray Client server, which runs on\n    # a remote node where the files aren\'t available.\n    if runtime_env:\n        if isinstance(runtime_env, dict):\n            return RuntimeEnv(**(runtime_env or {}))\n        raise TypeError(\n            "runtime_env must be dict or RuntimeEnv, ",\n            f"but got: {type(runtime_env)}",\n        )\n    else:\n        # Keep the new_runtime_env as None.  In .remote(), we need to know\n        # if runtime_env is None to know whether or not to fall back to the\n        # runtime_env specified in the @ray.remote decorator.\n        return None\n',
                },
                isinstance: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778b80',
                  hash: 'python/hash/0x27a186',
                  snapshot: '<built-in function isinstance>',
                },
                list: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e9100',
                  hash: 'python/hash/0x1026e910',
                  snapshot: "<class 'list'>",
                },
                tuple: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e54a0',
                  hash: 'python/hash/0x1026e54a',
                  snapshot: "<class 'tuple'>",
                },
                PlacementGroupSchedulingStrategy: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13e139440',
                  hash: 'python/hash/0x13e13944',
                  snapshot:
                    "<class 'ray.util.scheduling_strategies.PlacementGroupSchedulingStrategy'>",
                },
                _warn_if_using_deprecated_placement_group: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aabf4c0',
                  hash: 'python/hash/0x10aabf4c',
                  module: 'ray._private.ray_option_utils',
                  name: '_warn_if_using_deprecated_placement_group',
                  boundvars: {
                    options: {
                      kind: 'unbound',
                      annotation: 'typing.Dict[str, typing.Any]',
                    },
                    caller_stacklevel: {
                      kind: 'unbound',
                      annotation: "<class 'int'>",
                    },
                  },
                  freevars: {
                    warnings: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x1008a52c0',
                      hash: 'python/hash/0x1008a52c',
                      snapshot:
                        "<module 'warnings' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/warnings.py'>",
                    },
                    get_ray_doc_version: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aab4b80',
                      hash: 'python/hash/0x10aab4b8',
                      module: 'ray._private.utils',
                      name: 'get_ray_doc_version',
                      boundvars: {},
                      freevars: {
                        re: {
                          kind: 'object',
                          type: 'builtins.module',
                          id: 'python/id/0x10093fe00',
                          hash: 'python/hash/0x10093fe0',
                          snapshot:
                            "<module 're' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/re.py'>",
                        },
                        ray: {
                          kind: 'object',
                          type: 'builtins.module',
                          id: 'python/id/0x105576ef0',
                          hash: 'python/hash/0x105576ef',
                          snapshot:
                            "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'typing.Any' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/utils.py',
                      firstlineno: 1081,
                      source:
                        'def get_ray_doc_version():\n    """Get the docs.ray.io version corresponding to the ray.__version__."""\n    # The ray.__version__ can be official Ray release (such as 1.12.0), or\n    # dev (3.0.0dev0) or release candidate (2.0.0rc0). For the later we map\n    # to the master doc version at docs.ray.io.\n    if re.match(r"^\\d+\\.\\d+\\.\\d+$", ray.__version__) is None:\n        return "master"\n    # For the former (official Ray release), we have corresponding doc version\n    # released as well.\n    return f"releases-{ray.__version__}"\n',
                      docstring:
                        'Get the docs.ray.io version corresponding to the ray.__version__.',
                    },
                    DeprecationWarning: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x10269f148',
                      hash: 'python/hash/-0x7fffffffefd960ec',
                      snapshot: "<class 'DeprecationWarning'>",
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/ray_option_utils.py',
                  firstlineno: 239,
                  source:
                    'def _warn_if_using_deprecated_placement_group(\n    options: Dict[str, Any], caller_stacklevel: int\n):\n    placement_group = options["placement_group"]\n    placement_group_bundle_index = options["placement_group_bundle_index"]\n    placement_group_capture_child_tasks = options["placement_group_capture_child_tasks"]\n    if placement_group != "default":\n        warnings.warn(\n            "placement_group parameter is deprecated. Use "\n            "scheduling_strategy=PlacementGroupSchedulingStrategy(...) "\n            "instead, see the usage at "\n            f"https://docs.ray.io/en/{get_ray_doc_version()}/ray-core/package-ref.html#ray-remote.",  # noqa: E501\n            DeprecationWarning,\n            stacklevel=caller_stacklevel + 1,\n        )\n    if placement_group_bundle_index != -1:\n        warnings.warn(\n            "placement_group_bundle_index parameter is deprecated. Use "\n            "scheduling_strategy=PlacementGroupSchedulingStrategy(...) "\n            "instead, see the usage at "\n            f"https://docs.ray.io/en/{get_ray_doc_version()}/ray-core/package-ref.html#ray-remote.",  # noqa: E501\n            DeprecationWarning,\n            stacklevel=caller_stacklevel + 1,\n        )\n    if placement_group_capture_child_tasks:\n        warnings.warn(\n            "placement_group_capture_child_tasks parameter is deprecated. Use "\n            "scheduling_strategy=PlacementGroupSchedulingStrategy(...) "\n            "instead, see the usage at "\n            f"https://docs.ray.io/en/{get_ray_doc_version()}/ray-core/package-ref.html#ray-remote.",  # noqa: E501\n            DeprecationWarning,\n            stacklevel=caller_stacklevel + 1,\n        )\n',
                },
                _configure_placement_group_based_on_context: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aac1550',
                  hash: 'python/hash/0x10aac155',
                  module: 'ray.util.placement_group',
                  name: '_configure_placement_group_based_on_context',
                  boundvars: {
                    placement_group_capture_child_tasks: {
                      kind: 'unbound',
                      annotation: "<class 'bool'>",
                    },
                    bundle_index: {
                      kind: 'unbound',
                      annotation: "<class 'int'>",
                    },
                    resources: { kind: 'unbound', annotation: 'typing.Dict' },
                    placement_resources: {
                      kind: 'unbound',
                      annotation: 'typing.Dict',
                    },
                    task_or_actor_repr: {
                      kind: 'unbound',
                      annotation: "<class 'str'>",
                    },
                    placement_group: {
                      kind: 'object',
                      type: 'builtins.str',
                      id: 'python/id/0x10077bc70',
                      hash: 'python/hash/0x16cd15e8cf278abb',
                      snapshot: "'default'",
                    },
                  },
                  freevars: {
                    AssertionError: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x10269df60',
                      hash: 'python/hash/0x10269df6',
                      snapshot: "<class 'AssertionError'>",
                    },
                    PlacementGroup: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x13e13a8a0',
                      hash: 'python/hash/0x13e13a8a',
                      snapshot: "<class 'ray.util.placement_group.PlacementGroup'>",
                    },
                    get_current_placement_group: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aac1310',
                      hash: 'python/hash/0x10aac131',
                      module: 'ray.util.placement_group',
                      name: 'get_current_placement_group',
                      boundvars: {},
                      freevars: {
                        auto_init_ray: {
                          kind: 'function',
                          type: 'builtins.function',
                          id: 'python/id/0x10a9629d0',
                          hash: 'python/hash/0x10a9629d',
                          module: 'ray._private.auto_init_hook',
                          name: 'auto_init_ray',
                          boundvars: {},
                          freevars: {
                            os: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x100826590',
                              hash: 'python/hash/0x10082659',
                              snapshot:
                                "<module 'os' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/os.py'>",
                            },
                            ray: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x105576ef0',
                              hash: 'python/hash/0x105576ef',
                              snapshot:
                                "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                            },
                            auto_init_lock: {
                              kind: 'object',
                              type: '_thread.lock',
                              id: 'python/id/0x10a9619f0',
                              hash: 'python/hash/0x10a9619f',
                              snapshot: '<unlocked _thread.lock object at 0x10a9619f0>',
                            },
                          },
                          retval: { kind: 'unbound', annotation: 'typing.Any' },
                          filename:
                            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/auto_init_hook.py',
                          firstlineno: 9,
                          source:
                            'def auto_init_ray():\n    if (\n        os.environ.get("RAY_ENABLE_AUTO_CONNECT", "") != "0"\n        and not ray.is_initialized()\n    ):\n        auto_init_lock.acquire()\n        if not ray.is_initialized():\n            ray.init()\n        auto_init_lock.release()\n',
                        },
                        client_mode_should_convert: {
                          kind: 'function',
                          type: 'builtins.function',
                          id: 'python/id/0x10a9650d0',
                          hash: 'python/hash/0x10a9650d',
                          module: 'ray._private.client_mode_hook',
                          name: 'client_mode_should_convert',
                          boundvars: {},
                          freevars: {
                            is_client_mode_enabled: {
                              kind: 'object',
                              type: 'builtins.bool',
                              id: 'python/id/0x1026e8cd8',
                              hash: 'python/hash/0x0',
                              snapshot: 'False',
                            },
                            is_client_mode_enabled_by_default: {
                              kind: 'object',
                              type: 'builtins.bool',
                              id: 'python/id/0x1026e8cd8',
                              hash: 'python/hash/0x0',
                              snapshot: 'False',
                            },
                            _get_client_hook_status_on_thread: {
                              kind: 'function',
                              type: 'builtins.function',
                              id: 'python/id/0x10a962940',
                              hash: 'python/hash/0x10a96294',
                              module: 'ray._private.client_mode_hook',
                              name: '_get_client_hook_status_on_thread',
                              boundvars: {},
                              freevars: {
                                hasattr: {
                                  kind: 'object',
                                  type: 'builtins.builtin_function_or_method',
                                  id: 'python/id/0x1007789f0',
                                  hash: 'python/hash/0x27a154',
                                  snapshot: '<built-in function hasattr>',
                                },
                                _client_hook_status_on_thread: {
                                  kind: 'object',
                                  type: '_thread._local',
                                  id: 'python/id/0x10a9608b0',
                                  hash: 'python/hash/0x10a9608b',
                                  snapshot: '<_thread._local object at 0x10a9608b0>',
                                },
                              },
                              retval: {
                                kind: 'unbound',
                                annotation: 'typing.Any',
                              },
                              filename:
                                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                              firstlineno: 27,
                              source:
                                'def _get_client_hook_status_on_thread():\n    """Get\'s the value of `_client_hook_status_on_thread`.\n    Since `_client_hook_status_on_thread` is a thread-local variable, we may\n    need to add and set the \'status\' attribute.\n    """\n    global _client_hook_status_on_thread\n    if not hasattr(_client_hook_status_on_thread, "status"):\n        _client_hook_status_on_thread.status = True\n    return _client_hook_status_on_thread.status\n',
                              docstring:
                                "Get's the value of `_client_hook_status_on_thread`.\nSince `_client_hook_status_on_thread` is a thread-local variable, we may\nneed to add and set the 'status' attribute.",
                            },
                          },
                          retval: { kind: 'unbound', annotation: 'typing.Any' },
                          filename:
                            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                          firstlineno: 108,
                          source:
                            'def client_mode_should_convert():\n    """Determines if functions should be converted to client mode."""\n\n    # `is_client_mode_enabled_by_default` is used for testing with\n    # `RAY_CLIENT_MODE=1`. This flag means all tests run with client mode.\n    return (\n        is_client_mode_enabled or is_client_mode_enabled_by_default\n    ) and _get_client_hook_status_on_thread()\n',
                          docstring:
                            'Determines if functions should be converted to client mode.',
                        },
                        ray: {
                          kind: 'object',
                          type: 'builtins.module',
                          id: 'python/id/0x105576ef0',
                          hash: 'python/hash/0x105576ef',
                          snapshot:
                            "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                        },
                        PlacementGroup: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x13e13a8a0',
                          hash: 'python/hash/0x13e13a8a',
                          snapshot: "<class 'ray.util.placement_group.PlacementGroup'>",
                        },
                      },
                      retval: {
                        kind: 'unbound',
                        annotation:
                          'typing.Union[ray.util.placement_group.PlacementGroup, NoneType]',
                      },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                      firstlineno: 296,
                      source:
                        '@PublicAPI\ndef get_current_placement_group() -> Optional[PlacementGroup]:\n    """Get the current placement group which a task or actor is using.\n\n    It returns None if there\'s no current placement group for the worker.\n    For example, if you call this method in your driver, it returns None\n    (because drivers never belong to any placement group).\n\n    Examples:\n        .. testcode::\n\n            import ray\n            from ray.util.placement_group import get_current_placement_group\n            from ray.util.scheduling_strategies import PlacementGroupSchedulingStrategy\n\n            @ray.remote\n            def f():\n                # This returns the placement group the task f belongs to.\n                # It means this pg is identical to the pg created below.\n                return get_current_placement_group()\n\n            pg = ray.util.placement_group([{"CPU": 2}])\n            assert ray.get(f.options(\n                    scheduling_strategy=PlacementGroupSchedulingStrategy(\n                        placement_group=pg)).remote()) == pg\n\n            # Driver doesn\'t belong to any placement group,\n            # so it returns None.\n            assert get_current_placement_group() is None\n\n    Return:\n        PlacementGroup: Placement group object.\n            None if the current task or actor wasn\'t\n            created with any placement group.\n    """\n    auto_init_ray()\n    if client_mode_should_convert():\n        # Client mode is only a driver.\n        return None\n    worker = ray._private.worker.global_worker\n    worker.check_connected()\n    pg_id = worker.placement_group_id\n    if pg_id.is_nil():\n        return None\n    return PlacementGroup(pg_id)\n',
                      docstring:
                        "Get the current placement group which a task or actor is using.\n\nIt returns None if there's no current placement group for the worker.\nFor example, if you call this method in your driver, it returns None\n(because drivers never belong to any placement group).\n\nExamples:\n    .. testcode::\n\n        import ray\n        from ray.util.placement_group import get_current_placement_group\n        from ray.util.scheduling_strategies import PlacementGroupSchedulingStrategy\n\n        @ray.remote\n        def f():\n            # This returns the placement group the task f belongs to.\n            # It means this pg is identical to the pg created below.\n            return get_current_placement_group()\n\n        pg = ray.util.placement_group([{\"CPU\": 2}])\n        assert ray.get(f.options(\n                scheduling_strategy=PlacementGroupSchedulingStrategy(\n                    placement_group=pg)).remote()) == pg\n\n        # Driver doesn't belong to any placement group,\n        # so it returns None.\n        assert get_current_placement_group() is None\n\nReturn:\n    PlacementGroup: Placement group object.\n        None if the current task or actor wasn't\n        created with any placement group.\n\nPublicAPI: This API is stable across Ray releases.",
                    },
                    isinstance: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x100778b80',
                      hash: 'python/hash/0x27a186',
                      snapshot: '<built-in function isinstance>',
                    },
                    check_placement_group_index: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aac13a0',
                      hash: 'python/hash/0x10aac13a',
                      module: 'ray.util.placement_group',
                      name: 'check_placement_group_index',
                      boundvars: {
                        placement_group: {
                          kind: 'unbound',
                          annotation:
                            "<class 'ray.util.placement_group.PlacementGroup'>",
                        },
                        bundle_index: {
                          kind: 'unbound',
                          annotation: "<class 'int'>",
                        },
                      },
                      freevars: {
                        AssertionError: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x10269df60',
                          hash: 'python/hash/0x10269df6',
                          snapshot: "<class 'AssertionError'>",
                        },
                        ValueError: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x10269d740',
                          hash: 'python/hash/0x10269d74',
                          snapshot: "<class 'ValueError'>",
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'None' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                      firstlineno: 343,
                      source:
                        'def check_placement_group_index(\n    placement_group: PlacementGroup, bundle_index: int\n) -> None:\n    assert placement_group is not None\n    if placement_group.id.is_nil():\n        if bundle_index != -1:\n            raise ValueError(\n                "If placement group is not set, "\n                "the value of bundle index must be -1."\n            )\n    elif bundle_index >= placement_group.bundle_count or bundle_index < -1:\n        raise ValueError(\n            f"placement group bundle index {bundle_index} "\n            f"is invalid. Valid placement group indexes: "\n            f"0-{placement_group.bundle_count}"\n        )\n',
                    },
                    _validate_resource_shape: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aac14c0',
                      hash: 'python/hash/0x10aac14c',
                      module: 'ray.util.placement_group',
                      name: '_validate_resource_shape',
                      boundvars: {
                        placement_group: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        resources: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        placement_resources: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        task_or_actor_repr: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                      },
                      freevars: {
                        _valid_resource_shape: {
                          kind: 'function',
                          type: 'builtins.function',
                          id: 'python/id/0x10aac1430',
                          hash: 'python/hash/0x10aac143',
                          module: 'ray.util.placement_group',
                          name: '_valid_resource_shape',
                          boundvars: {
                            resources: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            bundle_specs: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                          },
                          freevars: {
                            BUNDLE_RESOURCE_LABEL: {
                              kind: 'object',
                              type: 'builtins.str',
                              id: 'python/id/0x1041b8ef0',
                              hash: 'python/hash/0xea1fe391db5f16a',
                              snapshot: "'bundle'",
                            },
                          },
                          retval: { kind: 'unbound', annotation: 'typing.Any' },
                          filename:
                            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                          firstlineno: 361,
                          source:
                            'def _valid_resource_shape(resources, bundle_specs):\n    """\n    If the resource shape cannot fit into every\n    bundle spec, return False\n    """\n    for bundle in bundle_specs:\n        fit_in_bundle = True\n        for resource, requested_val in resources.items():\n            # Skip "bundle" resource as it is automatically added\n            # to all nodes with bundles by the placement group.\n            if resource == BUNDLE_RESOURCE_LABEL:\n                continue\n            if bundle.get(resource, 0) < requested_val:\n                fit_in_bundle = False\n                break\n        if fit_in_bundle:\n            # If resource request fits in any bundle, it is valid.\n            return True\n    return False\n',
                          docstring:
                            'If the resource shape cannot fit into every\nbundle spec, return False',
                        },
                        ValueError: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x10269d740',
                          hash: 'python/hash/0x10269d74',
                          snapshot: "<class 'ValueError'>",
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'typing.Any' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                      firstlineno: 382,
                      source:
                        'def _validate_resource_shape(\n    placement_group, resources, placement_resources, task_or_actor_repr\n):\n    bundles = placement_group.bundle_specs\n    resources_valid = _valid_resource_shape(resources, bundles)\n    placement_resources_valid = _valid_resource_shape(placement_resources, bundles)\n\n    if not resources_valid:\n        raise ValueError(\n            f"Cannot schedule {task_or_actor_repr} with "\n            "the placement group because the resource request "\n            f"{resources} cannot fit into any bundles for "\n            f"the placement group, {bundles}."\n        )\n    if not placement_resources_valid:\n        # Happens for the default actor case.\n        # placement_resources is not an exposed concept to users,\n        # so we should write more specialized error messages.\n        raise ValueError(\n            f"Cannot schedule {task_or_actor_repr} with "\n            "the placement group because the actor requires "\n            f"{placement_resources.get(\'CPU\', 0)} CPU for "\n            "creation, but it cannot "\n            f"fit into any bundles for the placement group, "\n            f"{bundles}. Consider "\n            "creating a placement group with CPU resources."\n        )\n',
                    },
                  },
                  retval: {
                    kind: 'unbound',
                    annotation: "<class 'ray.util.placement_group.PlacementGroup'>",
                  },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                  firstlineno: 411,
                  source:
                    'def _configure_placement_group_based_on_context(\n    placement_group_capture_child_tasks: bool,\n    bundle_index: int,\n    resources: Dict,\n    placement_resources: Dict,\n    task_or_actor_repr: str,\n    placement_group: Union[PlacementGroup, str, None] = "default",\n) -> PlacementGroup:\n    """Configure the placement group based on the given context.\n\n    Based on the given context, this API returns the placement group instance\n    for task/actor scheduling.\n\n    Params:\n        placement_group_capture_child_tasks: Whether or not the\n            placement group needs to be captured from the global\n            context.\n        bundle_index: The bundle index for tasks/actor scheduling.\n        resources: The scheduling resources.\n        placement_resources: The scheduling placement resources for\n            actors.\n        task_or_actor_repr: The repr of task or actor\n            function/class descriptor.\n        placement_group: The placement group instance.\n            - "default": Default placement group argument. Currently,\n                the default behavior is to capture the parent task\'\n                placement group if placement_group_capture_child_tasks\n                is set.\n            - None: means placement group is explicitly not configured.\n            - Placement group instance: In this case, do nothing.\n\n    Returns:\n        Placement group instance based on the given context.\n\n    Raises:\n        ValueError: If the bundle index is invalid for the placement group\n            or the requested resources shape doesn\'t fit to any\n            bundles.\n    """\n    # Validate inputs.\n    assert placement_group_capture_child_tasks is not None\n    assert resources is not None\n\n    # Validate and get the PlacementGroup instance.\n    # Placement group could be None, default, or placement group.\n    # Default behavior is "do not capture child tasks".\n    if placement_group != "default":\n        if not placement_group:\n            placement_group = PlacementGroup.empty()\n    elif placement_group == "default":\n        if placement_group_capture_child_tasks:\n            placement_group = get_current_placement_group()\n        else:\n            placement_group = PlacementGroup.empty()\n\n    if not placement_group:\n        placement_group = PlacementGroup.empty()\n    assert isinstance(placement_group, PlacementGroup)\n\n    # Validate the index.\n    check_placement_group_index(placement_group, bundle_index)\n\n    # Validate the shape.\n    if not placement_group.is_empty:\n        _validate_resource_shape(\n            placement_group, resources, placement_resources, task_or_actor_repr\n        )\n    return placement_group\n',
                  docstring:
                    'Configure the placement group based on the given context.\n\nBased on the given context, this API returns the placement group instance\nfor task/actor scheduling.\n\nParams:\n    placement_group_capture_child_tasks: Whether or not the\n        placement group needs to be captured from the global\n        context.\n    bundle_index: The bundle index for tasks/actor scheduling.\n    resources: The scheduling resources.\n    placement_resources: The scheduling placement resources for\n        actors.\n    task_or_actor_repr: The repr of task or actor\n        function/class descriptor.\n    placement_group: The placement group instance.\n        - "default": Default placement group argument. Currently,\n            the default behavior is to capture the parent task\'\n            placement group if placement_group_capture_child_tasks\n            is set.\n        - None: means placement group is explicitly not configured.\n        - Placement group instance: In this case, do nothing.\n\nReturns:\n    Placement group instance based on the given context.\n\nRaises:\n    ValueError: If the bundle index is invalid for the placement group\n        or the requested resources shape doesn\'t fit to any\n        bundles.',
                },
                get_runtime_env_info: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aab6550',
                  hash: 'python/hash/0x10aab655',
                  module: 'ray._private.utils',
                  name: 'get_runtime_env_info',
                  boundvars: {
                    runtime_env: { kind: 'unbound', annotation: 'RuntimeEnv' },
                    is_job_runtime_env: {
                      kind: 'object',
                      type: 'builtins.bool',
                      id: 'python/id/0x1026e8cd8',
                      hash: 'python/hash/0x0',
                      snapshot: 'False',
                    },
                    serialize: {
                      kind: 'object',
                      type: 'builtins.bool',
                      id: 'python/id/0x1026e8cd8',
                      hash: 'python/hash/0x0',
                      snapshot: 'False',
                    },
                  },
                  freevars: {
                    ProtoRuntimeEnvInfo: {
                      kind: 'object',
                      type: 'google.protobuf.internal.python_message.GeneratedProtocolMessageType',
                      id: 'python/id/0x10329b610',
                      hash: 'python/hash/0x10329b61',
                      snapshot:
                        "<class 'src.ray.protobuf.runtime_env_common_pb2.RuntimeEnvInfo'>",
                    },
                    len: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x100778c70',
                      hash: 'python/hash/0x400000000027a1e0',
                      snapshot: '<built-in function len>',
                    },
                    isinstance: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x100778b80',
                      hash: 'python/hash/0x27a186',
                      snapshot: '<built-in function isinstance>',
                    },
                    bool: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x1026d9340',
                      hash: 'python/hash/0x1026d934',
                      snapshot: "<class 'bool'>",
                    },
                    TypeError: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x102699ab0',
                      hash: 'python/hash/0x102699ab',
                      snapshot: "<class 'TypeError'>",
                    },
                    type: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x1026e8698',
                      hash: 'python/hash/-0x7fffffffefd91797',
                      snapshot: "<class 'type'>",
                    },
                    json_format: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x10aaa0450',
                      hash: 'python/hash/0x10aaa045',
                      snapshot:
                        "<module 'google.protobuf.json_format' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/google/protobuf/json_format.py'>",
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/utils.py',
                  firstlineno: 1537,
                  source:
                    'def get_runtime_env_info(\n    runtime_env: "RuntimeEnv",\n    *,\n    is_job_runtime_env: bool = False,\n    serialize: bool = False,\n):\n    """Create runtime env info from runtime env.\n\n    In the user interface, the argument `runtime_env` contains some fields\n    which not contained in `ProtoRuntimeEnv` but in `ProtoRuntimeEnvInfo`,\n    such as `eager_install`. This function will extract those fields from\n    `RuntimeEnv` and create a new `ProtoRuntimeEnvInfo`, and serialize it.\n    """\n    from ray.runtime_env import RuntimeEnvConfig\n\n    proto_runtime_env_info = ProtoRuntimeEnvInfo()\n\n    if runtime_env.working_dir_uri():\n        proto_runtime_env_info.uris.working_dir_uri = runtime_env.working_dir_uri()\n    if len(runtime_env.py_modules_uris()) > 0:\n        proto_runtime_env_info.uris.py_modules_uris[:] = runtime_env.py_modules_uris()\n\n    # TODO(Catch-Bull): overload `__setitem__` for `RuntimeEnv`, change the\n    # runtime_env of all internal code from dict to RuntimeEnv.\n\n    runtime_env_config = runtime_env.get("config")\n    if runtime_env_config is None:\n        runtime_env_config = RuntimeEnvConfig.default_config()\n    else:\n        runtime_env_config = RuntimeEnvConfig.parse_and_validate_runtime_env_config(\n            runtime_env_config\n        )\n\n    proto_runtime_env_info.runtime_env_config.CopyFrom(\n        runtime_env_config.build_proto_runtime_env_config()\n    )\n\n    # Normally, `RuntimeEnv` should guarantee the accuracy of field eager_install,\n    # but so far, the internal code has not completely prohibited direct\n    # modification of fields in RuntimeEnv, so we should check it for insurance.\n    eager_install = (\n        runtime_env_config.get("eager_install")\n        if runtime_env_config is not None\n        else None\n    )\n    if is_job_runtime_env or eager_install is not None:\n        if eager_install is None:\n            eager_install = True\n        elif not isinstance(eager_install, bool):\n            raise TypeError(\n                f"eager_install must be a boolean. got {type(eager_install)}"\n            )\n        proto_runtime_env_info.runtime_env_config.eager_install = eager_install\n\n    proto_runtime_env_info.serialized_runtime_env = runtime_env.serialize()\n\n    if not serialize:\n        return proto_runtime_env_info\n\n    return json_format.MessageToJson(proto_runtime_env_info)\n',
                  docstring:
                    'Create runtime env info from runtime env.\n\nIn the user interface, the argument `runtime_env` contains some fields\nwhich not contained in `ProtoRuntimeEnv` but in `ProtoRuntimeEnvInfo`,\nsuch as `eager_install`. This function will extract those fields from\n`RuntimeEnv` and create a new `ProtoRuntimeEnvInfo`, and serialize it.',
                },
                _task_launch_hook: {
                  kind: 'object',
                  type: 'builtins.NoneType',
                  id: 'python/id/0x1026e94f0',
                  hash: 'python/hash/0x1026e94f',
                  snapshot: 'None',
                },
              },
              retval: {
                kind: 'sequence',
                type: 'builtins.list',
                id: 'python/id/0x336d08200',
                snapshot:
                  '[ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000001000000),\n ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000),\n ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000003000000),\n ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000004000000)]',
                values: [
                  {
                    kind: 'object',
                    type: 'ray._raylet.ObjectRef',
                    id: 'ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000001000000)',
                    hash: 'python/hash/-0x6e80f518b97bafd6',
                    snapshot:
                      'ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000001000000)',
                  },
                  {
                    kind: 'object',
                    type: 'ray._raylet.ObjectRef',
                    id: 'ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000)',
                    hash: 'python/hash/-0x69cb2fec032aee0e',
                    snapshot:
                      'ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000)',
                  },
                  {
                    kind: 'object',
                    type: 'ray._raylet.ObjectRef',
                    id: 'ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000003000000)',
                    hash: 'python/hash/-0x184d8dc6e278179',
                    snapshot:
                      'ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000003000000)',
                  },
                  {
                    kind: 'object',
                    type: 'ray._raylet.ObjectRef',
                    id: 'ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000004000000)',
                    hash: 'python/hash/-0x5a00b43d473eee67',
                    snapshot:
                      'ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000004000000)',
                  },
                ],
              },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
              firstlineno: 244,
              source:
                '@_tracing_task_invocation\ndef _remote(self, args=None, kwargs=None, **task_options):\n    """Submit the remote function for execution."""\n    # We pop the "max_calls" coming from "@ray.remote" here. We no longer need\n    # it in "_remote()".\n    task_options.pop("max_calls", None)\n    auto_init_ray()\n    if client_mode_should_convert():\n        return client_mode_convert_function(self, args, kwargs, **task_options)\n\n    worker = ray._private.worker.global_worker\n    worker.check_connected()\n\n    # If this function was not exported in this session and job, we need to\n    # export this function again, because the current GCS doesn\'t have it.\n    if (\n        not self._is_cross_language\n        and self._last_export_session_and_job != worker.current_session_and_job\n    ):\n        self._function_descriptor = PythonFunctionDescriptor.from_function(\n            self._function, self._uuid\n        )\n        # There is an interesting question here. If the remote function is\n        # used by a subsequent driver (in the same script), should the\n        # second driver pickle the function again? If yes, then the remote\n        # function definition can differ in the second driver (e.g., if\n        # variables in its closure have changed). We probably want the\n        # behavior of the remote function in the second driver to be\n        # independent of whether or not the function was invoked by the\n        # first driver. This is an argument for repickling the function,\n        # which we do here.\n        self._pickled_function = pickle_dumps(\n            self._function,\n            f"Could not serialize the function {self._function_descriptor.repr}",\n        )\n\n        self._last_export_session_and_job = worker.current_session_and_job\n        worker.function_actor_manager.export(self)\n\n    kwargs = {} if kwargs is None else kwargs\n    args = [] if args is None else args\n\n    # fill task required options\n    for k, v in ray_option_utils.task_options.items():\n        if k == "max_retries":\n            # TODO(swang): We need to override max_retries here because the default\n            # value gets set at Ray import time. Ideally, we should allow setting\n            # default values from env vars for other options too.\n            v.default_value = os.environ.get(\n                "RAY_TASK_MAX_RETRIES", v.default_value\n            )\n            v.default_value = int(v.default_value)\n        task_options[k] = task_options.get(k, v.default_value)\n    # "max_calls" already takes effects and should not apply again.\n    # Remove the default value here.\n    task_options.pop("max_calls", None)\n\n    # TODO(suquark): cleanup these fields\n    name = task_options["name"]\n    runtime_env = parse_runtime_env(task_options["runtime_env"])\n    placement_group = task_options["placement_group"]\n    placement_group_bundle_index = task_options["placement_group_bundle_index"]\n    placement_group_capture_child_tasks = task_options[\n        "placement_group_capture_child_tasks"\n    ]\n    scheduling_strategy = task_options["scheduling_strategy"]\n    num_returns = task_options["num_returns"]\n    if num_returns == "dynamic":\n        num_returns = -1\n    elif num_returns == "streaming":\n        # TODO(sang): This is a temporary private API.\n        # Remove it when we migrate to the streaming generator.\n        num_returns = ray._raylet.STREAMING_GENERATOR_RETURN\n\n    max_retries = task_options["max_retries"]\n    retry_exceptions = task_options["retry_exceptions"]\n    if isinstance(retry_exceptions, (list, tuple)):\n        retry_exception_allowlist = tuple(retry_exceptions)\n        retry_exceptions = True\n    else:\n        retry_exception_allowlist = None\n\n    if scheduling_strategy is None or not isinstance(\n        scheduling_strategy, PlacementGroupSchedulingStrategy\n    ):\n        _warn_if_using_deprecated_placement_group(task_options, 4)\n\n    resources = ray._private.utils.resources_from_ray_options(task_options)\n\n    if scheduling_strategy is None or isinstance(\n        scheduling_strategy, PlacementGroupSchedulingStrategy\n    ):\n        if isinstance(scheduling_strategy, PlacementGroupSchedulingStrategy):\n            placement_group = scheduling_strategy.placement_group\n            placement_group_bundle_index = (\n                scheduling_strategy.placement_group_bundle_index\n            )\n            placement_group_capture_child_tasks = (\n                scheduling_strategy.placement_group_capture_child_tasks\n            )\n\n        if placement_group_capture_child_tasks is None:\n            placement_group_capture_child_tasks = (\n                worker.should_capture_child_tasks_in_placement_group\n            )\n        placement_group = _configure_placement_group_based_on_context(\n            placement_group_capture_child_tasks,\n            placement_group_bundle_index,\n            resources,\n            {},  # no placement_resources for tasks\n            self._function_descriptor.function_name,\n            placement_group=placement_group,\n        )\n        if not placement_group.is_empty:\n            scheduling_strategy = PlacementGroupSchedulingStrategy(\n                placement_group,\n                placement_group_bundle_index,\n                placement_group_capture_child_tasks,\n            )\n        else:\n            scheduling_strategy = "DEFAULT"\n\n    serialized_runtime_env_info = None\n    if runtime_env is not None:\n        serialized_runtime_env_info = get_runtime_env_info(\n            runtime_env,\n            is_job_runtime_env=False,\n            serialize=True,\n        )\n\n    if _task_launch_hook:\n        _task_launch_hook(self._function_descriptor, resources, scheduling_strategy)\n\n    def invocation(args, kwargs):\n        if self._is_cross_language:\n            list_args = cross_language._format_args(worker, args, kwargs)\n        elif not args and not kwargs and not self._function_signature:\n            list_args = []\n        else:\n            list_args = ray._private.signature.flatten_args(\n                self._function_signature, args, kwargs\n            )\n\n        if worker.mode == ray._private.worker.LOCAL_MODE:\n            assert (\n                not self._is_cross_language\n            ), "Cross language remote function cannot be executed locally."\n        object_refs = worker.core_worker.submit_task(\n            self._language,\n            self._function_descriptor,\n            list_args,\n            name if name is not None else "",\n            num_returns,\n            resources,\n            max_retries,\n            retry_exceptions,\n            retry_exception_allowlist,\n            scheduling_strategy,\n            worker.debugger_breakpoint,\n            serialized_runtime_env_info or "{}",\n        )\n        # Reset worker\'s debug context from the last "remote" command\n        # (which applies only to this .remote call).\n        worker.debugger_breakpoint = b""\n        if num_returns == STREAMING_GENERATOR_RETURN:\n            # Streaming generator will return a single ref\n            # that is for the generator task.\n            assert len(object_refs) == 1\n            generator_ref = object_refs[0]\n            return StreamingObjectRefGenerator(generator_ref, worker)\n        if len(object_refs) == 1:\n            return object_refs[0]\n        elif len(object_refs) > 1:\n            return object_refs\n\n    if self._decorator is not None:\n        invocation = self._decorator(invocation)\n\n    return invocation(args, kwargs)\n',
              docstring: 'Submit the remote function for execution.',
            },
            stackframes: [
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
                lineno: 244,
                func: '_remote',
                code: '    @_tracing_task_invocation\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/tracing/tracing_helper.py',
                lineno: 306,
                func: '_invocation_remote_span',
                code: '            return method(self, args, kwargs, *_args, **_kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
                lineno: 108,
                func: '_remote',
                code: '        return super()._remote(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
                lineno: 230,
                func: 'remote',
                code: '                return func_cls._remote(args=args, kwargs=kwargs, **updated_options)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
                lineno: 98,
                func: 'wrapper',
                code: '                sfd.remote(self._run)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
                lineno: 81,
                func: 'pyu_to_spu',
                code: '    meta, io_info, *shares_chunk = self.device(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 80,
                func: 'dispatch',
                code: '        return self._ops[device_type][name](*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 111,
                func: 'dispatch',
                code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
                lineno: 68,
                func: 'to',
                code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
              },
              {
                filename: 'presets/millionaires/_algorithm.py',
                lineno: 29,
                func: '<module>',
                code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
              },
              {
                filename: 'Cell In[3]',
                lineno: 35,
                func: '<module>',
                code: '        exec(_algorithm, globals())\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3508,
                func: 'run_code',
                code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3448,
                func: 'run_ast_nodes',
                code: '                if await self.run_code(code, result, async_=asy):\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3269,
                func: 'run_cell_async',
                code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
                lineno: 129,
                func: '_pseudo_sync_runner',
                code: '        coro.send(None)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3064,
                func: '_run_cell',
                code: '            result = runner(coro)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3009,
                func: 'run_cell',
                code: '            result = self._run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
                lineno: 546,
                func: 'run_cell',
                code: '        return super().run_cell(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
                lineno: 422,
                func: 'do_execute',
                code: '                    res = shell.run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 740,
                func: 'execute_request',
                code: '            reply_content = await reply_content\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 412,
                func: 'dispatch_shell',
                code: '                    await result\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 505,
                func: 'process_one',
                code: '        await dispatch(*args)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 516,
                func: 'dispatch_queue',
                code: '                await self.process_one()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
                lineno: 81,
                func: '_run',
                code: '            self._context.run(self._callback, *self._args)\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 1859,
                func: '_run_once',
                code: '                handle._run()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 570,
                func: 'run_forever',
                code: '                self._run_once()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
                lineno: 195,
                func: 'start',
                code: '        self.asyncio_loop.run_forever()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
                lineno: 736,
                func: 'start',
                code: '                self.io_loop.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
                lineno: 1051,
                func: 'launch_instance',
                code: '        app.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
                lineno: 17,
                func: '<module>',
                code: '    app.launch_new_instance()\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 87,
                func: '_run_code',
                code: '    exec(code, run_globals)\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 194,
                func: '_run_module_as_main',
                code: '    return _run_code(code, main_globals, None,\n',
              },
            ],
          },
          inner_calls: [],
        },
      ],
    },
    {
      span_id: '0x3dce20bbf033e81b',
      start_time: '2023-10-25T09:37:49.351920',
      end_time: '2023-10-25T09:37:49.368110',
      call: {
        checkpoint: { api_level: 10 },
        snapshot: {
          kind: 'function',
          type: 'builtins.function',
          id: 'python/id/0x17fd000d0',
          hash: 'python/hash/0x17fd000d',
          module: 'secretflow.device.device.spu',
          name: 'SPU.infeed_shares',
          boundvars: {
            self: {
              kind: 'remote_location',
              type: 'secretflow.device.device.spu.SPU',
              id: 'python/id/0x29f3d8f70',
              location: ['SPU', 'alice', 'bob'],
            },
            io_info: {
              kind: 'object',
              type: 'ray._raylet.ObjectRef',
              id: 'ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000)',
              hash: 'python/hash/-0x69cb2fec032aee0e',
              snapshot:
                'ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000)',
            },
            shares_chunk: {
              kind: 'sequence',
              type: 'builtins.list',
              id: 'python/id/0x336d33d40',
              snapshot:
                '[ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000003000000),\n ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000004000000)]',
              values: [
                {
                  kind: 'object',
                  type: 'ray._raylet.ObjectRef',
                  id: 'ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000003000000)',
                  hash: 'python/hash/-0x184d8dc6e278179',
                  snapshot:
                    'ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000003000000)',
                },
                {
                  kind: 'object',
                  type: 'ray._raylet.ObjectRef',
                  id: 'ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000004000000)',
                  hash: 'python/hash/-0x5a00b43d473eee67',
                  snapshot:
                    'ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000004000000)',
                },
              ],
            },
          },
          freevars: {
            len: {
              kind: 'object',
              type: 'builtins.builtin_function_or_method',
              id: 'python/id/0x100778c70',
              hash: 'python/hash/0x400000000027a1e0',
              snapshot: '<built-in function len>',
            },
            AssertionError: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x10269df60',
              hash: 'python/hash/0x10269df6',
              snapshot: "<class 'AssertionError'>",
            },
            int: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x1026e5160',
              hash: 'python/hash/0x1026e516',
              snapshot: "<class 'int'>",
            },
            enumerate: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x1026adff8',
              hash: 'python/hash/-0x7fffffffefd95201',
              snapshot: "<class 'enumerate'>",
            },
          },
          retval: {
            kind: 'sequence',
            type: 'builtins.list',
            id: 'python/id/0x336adc500',
            snapshot:
              '[ObjectRef(359ec6ce30d3ca2d391a127bdcd8868861c3cf380100000001000000),\n ObjectRef(1e8ff6d23613278417cc40abbca06574d6c7905a0100000001000000)]',
            values: [
              {
                kind: 'object',
                type: 'ray._raylet.ObjectRef',
                id: 'ray/ObjectRef(359ec6ce30d3ca2d391a127bdcd8868861c3cf380100000001000000)',
                hash: 'python/hash/-0x6b0b5b3da203adb3',
                snapshot:
                  'ObjectRef(359ec6ce30d3ca2d391a127bdcd8868861c3cf380100000001000000)',
              },
              {
                kind: 'object',
                type: 'ray._raylet.ObjectRef',
                id: 'ray/ObjectRef(1e8ff6d23613278417cc40abbca06574d6c7905a0100000001000000)',
                hash: 'python/hash/0x748f9035dbe52daf',
                snapshot:
                  'ObjectRef(1e8ff6d23613278417cc40abbca06574d6c7905a0100000001000000)',
              },
            ],
          },
          filename:
            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/spu.py',
          firstlineno: 1829,
          source:
            'def infeed_shares(\n    self,\n    io_info: Union[ray.ObjectRef, fed.FedObject],\n    shares_chunk: List[Union[ray.ObjectRef, fed.FedObject]],\n) -> List[Union[ray.ObjectRef, fed.FedObject]]:\n    assert (\n        len(shares_chunk) % len(self.actors) == 0\n    ), f"{len(shares_chunk)} , {len(self.actors)}"\n    chunks_pre_actor = int(len(shares_chunk) / len(self.actors))\n\n    ret = []\n    for i, actor in enumerate(self.actors.values()):\n        start_pos = i * chunks_pre_actor\n        end_pos = (i + 1) * chunks_pre_actor\n        ret.append(\n            actor.infeed_share.remote(io_info, *shares_chunk[start_pos:end_pos])\n        )\n\n    return ret\n',
        },
        stackframes: [
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/spu.py',
            lineno: 1829,
            func: 'infeed_shares',
            code: '    def infeed_shares(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
            lineno: 88,
            func: 'pyu_to_spu',
            code: '        spu.infeed_shares(io_info.data, [s.data for s in shares_chunk]),\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 80,
            func: 'dispatch',
            code: '        return self._ops[device_type][name](*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
            lineno: 111,
            func: 'dispatch',
            code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
            lineno: 68,
            func: 'to',
            code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
          },
          {
            filename: 'presets/millionaires/_algorithm.py',
            lineno: 29,
            func: '<module>',
            code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
          },
          {
            filename: 'Cell In[3]',
            lineno: 35,
            func: '<module>',
            code: '        exec(_algorithm, globals())\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3508,
            func: 'run_code',
            code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3448,
            func: 'run_ast_nodes',
            code: '                if await self.run_code(code, result, async_=asy):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3269,
            func: 'run_cell_async',
            code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
            lineno: 129,
            func: '_pseudo_sync_runner',
            code: '        coro.send(None)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3064,
            func: '_run_cell',
            code: '            result = runner(coro)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3009,
            func: 'run_cell',
            code: '            result = self._run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
            lineno: 546,
            func: 'run_cell',
            code: '        return super().run_cell(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
            lineno: 422,
            func: 'do_execute',
            code: '                    res = shell.run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 740,
            func: 'execute_request',
            code: '            reply_content = await reply_content\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 412,
            func: 'dispatch_shell',
            code: '                    await result\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 505,
            func: 'process_one',
            code: '        await dispatch(*args)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 516,
            func: 'dispatch_queue',
            code: '                await self.process_one()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
            lineno: 81,
            func: '_run',
            code: '            self._context.run(self._callback, *self._args)\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 1859,
            func: '_run_once',
            code: '                handle._run()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 570,
            func: 'run_forever',
            code: '                self._run_once()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
            lineno: 195,
            func: 'start',
            code: '        self.asyncio_loop.run_forever()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
            lineno: 736,
            func: 'start',
            code: '                self.io_loop.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
            lineno: 1051,
            func: 'launch_instance',
            code: '        app.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
            lineno: 17,
            func: '<module>',
            code: '    app.launch_new_instance()\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 87,
            func: '_run_code',
            code: '    exec(code, run_globals)\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 194,
            func: '_run_module_as_main',
            code: '    return _run_code(code, main_globals, None,\n',
          },
        ],
      },
      inner_calls: [
        {
          span_id: '0xe74fbd813e5a6a96',
          start_time: '2023-10-25T09:37:49.358720',
          end_time: '2023-10-25T09:37:49.359154',
          call: {
            checkpoint: { api_level: 10 },
            snapshot: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10b2c0940',
              hash: 'python/hash/0x10b2c094',
              module: 'ray.actor',
              name: 'ActorMethod._remote',
              boundvars: {
                self: {
                  kind: 'object',
                  type: 'ray.actor.ActorMethod',
                  id: 'python/id/0x3352976d0',
                  hash: 'python/hash/0x3352976d',
                  snapshot: '<ray.actor.ActorMethod object at 0x3352976d0>',
                },
                args: {
                  kind: 'sequence',
                  type: 'builtins.tuple',
                  id: 'python/id/0x336d0a580',
                  hash: 'python/hash/0x3929605b223d0a5',
                  snapshot:
                    '(ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000),\n ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000003000000))',
                  values: [
                    {
                      kind: 'object',
                      type: 'ray._raylet.ObjectRef',
                      id: 'ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000)',
                      hash: 'python/hash/-0x69cb2fec032aee0e',
                      snapshot:
                        'ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000)',
                    },
                    {
                      kind: 'object',
                      type: 'ray._raylet.ObjectRef',
                      id: 'ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000003000000)',
                      hash: 'python/hash/-0x184d8dc6e278179',
                      snapshot:
                        'ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000003000000)',
                    },
                  ],
                },
                kwargs: {
                  kind: 'mapping',
                  type: 'builtins.dict',
                  id: 'python/id/0x336bb1500',
                  snapshot: '{}',
                  values: {},
                },
                name: {
                  kind: 'object',
                  type: 'builtins.str',
                  id: 'python/id/0x10075a2f0',
                  hash: 'python/hash/0x0',
                  snapshot: "''",
                },
                num_returns: {
                  kind: 'object',
                  type: 'builtins.NoneType',
                  id: 'python/id/0x1026e94f0',
                  hash: 'python/hash/0x1026e94f',
                  snapshot: 'None',
                },
                concurrency_group: {
                  kind: 'object',
                  type: 'builtins.NoneType',
                  id: 'python/id/0x1026e94f0',
                  hash: 'python/hash/0x1026e94f',
                  snapshot: 'None',
                },
              },
              freevars: {},
              retval: {
                kind: 'object',
                type: 'ray._raylet.ObjectRef',
                id: 'ray/ObjectRef(359ec6ce30d3ca2d391a127bdcd8868861c3cf380100000001000000)',
                hash: 'python/hash/-0x6b0b5b3da203adb3',
                snapshot:
                  'ObjectRef(359ec6ce30d3ca2d391a127bdcd8868861c3cf380100000001000000)',
              },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/actor.py',
              firstlineno: 166,
              source:
                '@_tracing_actor_method_invocation\ndef _remote(\n    self, args=None, kwargs=None, name="", num_returns=None, concurrency_group=None\n):\n    if num_returns is None:\n        num_returns = self._num_returns\n\n    def invocation(args, kwargs):\n        actor = self._actor_hard_ref or self._actor_ref()\n        if actor is None:\n            raise RuntimeError("Lost reference to actor")\n        return actor._actor_method_call(\n            self._method_name,\n            args=args,\n            kwargs=kwargs,\n            name=name,\n            num_returns=num_returns,\n            concurrency_group_name=concurrency_group,\n        )\n\n    # Apply the decorator if there is one.\n    if self._decorator is not None:\n        invocation = self._decorator(invocation)\n\n    return invocation(args, kwargs)\n',
            },
            stackframes: [
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/actor.py',
                lineno: 166,
                func: '_remote',
                code: '    @_tracing_actor_method_invocation\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/tracing/tracing_helper.py',
                lineno: 423,
                func: '_start_span',
                code: '            return method(self, args, kwargs, *_args, **_kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/actor.py',
                lineno: 144,
                func: 'remote',
                code: '        return self._remote(args, kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/spu.py',
                lineno: 1844,
                func: 'infeed_shares',
                code: '                actor.infeed_share.remote(io_info, *shares_chunk[start_pos:end_pos])\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
                lineno: 88,
                func: 'pyu_to_spu',
                code: '        spu.infeed_shares(io_info.data, [s.data for s in shares_chunk]),\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 80,
                func: 'dispatch',
                code: '        return self._ops[device_type][name](*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 111,
                func: 'dispatch',
                code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
                lineno: 68,
                func: 'to',
                code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
              },
              {
                filename: 'presets/millionaires/_algorithm.py',
                lineno: 29,
                func: '<module>',
                code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
              },
              {
                filename: 'Cell In[3]',
                lineno: 35,
                func: '<module>',
                code: '        exec(_algorithm, globals())\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3508,
                func: 'run_code',
                code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3448,
                func: 'run_ast_nodes',
                code: '                if await self.run_code(code, result, async_=asy):\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3269,
                func: 'run_cell_async',
                code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
                lineno: 129,
                func: '_pseudo_sync_runner',
                code: '        coro.send(None)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3064,
                func: '_run_cell',
                code: '            result = runner(coro)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3009,
                func: 'run_cell',
                code: '            result = self._run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
                lineno: 546,
                func: 'run_cell',
                code: '        return super().run_cell(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
                lineno: 422,
                func: 'do_execute',
                code: '                    res = shell.run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 740,
                func: 'execute_request',
                code: '            reply_content = await reply_content\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 412,
                func: 'dispatch_shell',
                code: '                    await result\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 505,
                func: 'process_one',
                code: '        await dispatch(*args)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 516,
                func: 'dispatch_queue',
                code: '                await self.process_one()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
                lineno: 81,
                func: '_run',
                code: '            self._context.run(self._callback, *self._args)\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 1859,
                func: '_run_once',
                code: '                handle._run()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 570,
                func: 'run_forever',
                code: '                self._run_once()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
                lineno: 195,
                func: 'start',
                code: '        self.asyncio_loop.run_forever()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
                lineno: 736,
                func: 'start',
                code: '                self.io_loop.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
                lineno: 1051,
                func: 'launch_instance',
                code: '        app.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
                lineno: 17,
                func: '<module>',
                code: '    app.launch_new_instance()\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 87,
                func: '_run_code',
                code: '    exec(code, run_globals)\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 194,
                func: '_run_module_as_main',
                code: '    return _run_code(code, main_globals, None,\n',
              },
            ],
          },
          inner_calls: [],
        },
        {
          span_id: '0x444ab187c6cc9a55',
          start_time: '2023-10-25T09:37:49.365518',
          end_time: '2023-10-25T09:37:49.365941',
          call: {
            checkpoint: { api_level: 10 },
            snapshot: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10b2c0940',
              hash: 'python/hash/0x10b2c094',
              module: 'ray.actor',
              name: 'ActorMethod._remote',
              boundvars: {
                self: {
                  kind: 'object',
                  type: 'ray.actor.ActorMethod',
                  id: 'python/id/0x335280d00',
                  hash: 'python/hash/0x335280d0',
                  snapshot: '<ray.actor.ActorMethod object at 0x335280d00>',
                },
                args: {
                  kind: 'sequence',
                  type: 'builtins.tuple',
                  id: 'python/id/0x336d0a580',
                  hash: 'python/hash/0x30e7852d34289f15',
                  snapshot:
                    '(ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000),\n ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000004000000))',
                  values: [
                    {
                      kind: 'object',
                      type: 'ray._raylet.ObjectRef',
                      id: 'ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000)',
                      hash: 'python/hash/-0x69cb2fec032aee0e',
                      snapshot:
                        'ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000002000000)',
                    },
                    {
                      kind: 'object',
                      type: 'ray._raylet.ObjectRef',
                      id: 'ray/ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000004000000)',
                      hash: 'python/hash/-0x5a00b43d473eee67',
                      snapshot:
                        'ObjectRef(80e22aed7718a125ffffffffffffffffffffffff0100000004000000)',
                    },
                  ],
                },
                kwargs: {
                  kind: 'mapping',
                  type: 'builtins.dict',
                  id: 'python/id/0x336ba2280',
                  snapshot: '{}',
                  values: {},
                },
                name: {
                  kind: 'object',
                  type: 'builtins.str',
                  id: 'python/id/0x10075a2f0',
                  hash: 'python/hash/0x0',
                  snapshot: "''",
                },
                num_returns: {
                  kind: 'object',
                  type: 'builtins.NoneType',
                  id: 'python/id/0x1026e94f0',
                  hash: 'python/hash/0x1026e94f',
                  snapshot: 'None',
                },
                concurrency_group: {
                  kind: 'object',
                  type: 'builtins.NoneType',
                  id: 'python/id/0x1026e94f0',
                  hash: 'python/hash/0x1026e94f',
                  snapshot: 'None',
                },
              },
              freevars: {},
              retval: {
                kind: 'object',
                type: 'ray._raylet.ObjectRef',
                id: 'ray/ObjectRef(1e8ff6d23613278417cc40abbca06574d6c7905a0100000001000000)',
                hash: 'python/hash/0x748f9035dbe52daf',
                snapshot:
                  'ObjectRef(1e8ff6d23613278417cc40abbca06574d6c7905a0100000001000000)',
              },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/actor.py',
              firstlineno: 166,
              source:
                '@_tracing_actor_method_invocation\ndef _remote(\n    self, args=None, kwargs=None, name="", num_returns=None, concurrency_group=None\n):\n    if num_returns is None:\n        num_returns = self._num_returns\n\n    def invocation(args, kwargs):\n        actor = self._actor_hard_ref or self._actor_ref()\n        if actor is None:\n            raise RuntimeError("Lost reference to actor")\n        return actor._actor_method_call(\n            self._method_name,\n            args=args,\n            kwargs=kwargs,\n            name=name,\n            num_returns=num_returns,\n            concurrency_group_name=concurrency_group,\n        )\n\n    # Apply the decorator if there is one.\n    if self._decorator is not None:\n        invocation = self._decorator(invocation)\n\n    return invocation(args, kwargs)\n',
            },
            stackframes: [
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/actor.py',
                lineno: 166,
                func: '_remote',
                code: '    @_tracing_actor_method_invocation\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/tracing/tracing_helper.py',
                lineno: 423,
                func: '_start_span',
                code: '            return method(self, args, kwargs, *_args, **_kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/actor.py',
                lineno: 144,
                func: 'remote',
                code: '        return self._remote(args, kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/spu.py',
                lineno: 1844,
                func: 'infeed_shares',
                code: '                actor.infeed_share.remote(io_info, *shares_chunk[start_pos:end_pos])\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/kernels/pyu.py',
                lineno: 88,
                func: 'pyu_to_spu',
                code: '        spu.infeed_shares(io_info.data, [s.data for s in shares_chunk]),\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 80,
                func: 'dispatch',
                code: '        return self._ops[device_type][name](*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/register.py',
                lineno: 111,
                func: 'dispatch',
                code: '    return _registrar.dispatch(self.device_type, name, self, *args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/base.py',
                lineno: 68,
                func: 'to',
                code: '        return dispatch(_name_of_to(device.device_type), self, device, *args, **kwargs)\n',
              },
              {
                filename: 'presets/millionaires/_algorithm.py',
                lineno: 29,
                func: '<module>',
                code: 'balance_bob = balance_bob.to(devices(SPU, "alice", "bob"))\n',
              },
              {
                filename: 'Cell In[3]',
                lineno: 35,
                func: '<module>',
                code: '        exec(_algorithm, globals())\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3508,
                func: 'run_code',
                code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3448,
                func: 'run_ast_nodes',
                code: '                if await self.run_code(code, result, async_=asy):\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3269,
                func: 'run_cell_async',
                code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
                lineno: 129,
                func: '_pseudo_sync_runner',
                code: '        coro.send(None)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3064,
                func: '_run_cell',
                code: '            result = runner(coro)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
                lineno: 3009,
                func: 'run_cell',
                code: '            result = self._run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
                lineno: 546,
                func: 'run_cell',
                code: '        return super().run_cell(*args, **kwargs)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
                lineno: 422,
                func: 'do_execute',
                code: '                    res = shell.run_cell(\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 740,
                func: 'execute_request',
                code: '            reply_content = await reply_content\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 412,
                func: 'dispatch_shell',
                code: '                    await result\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 505,
                func: 'process_one',
                code: '        await dispatch(*args)\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
                lineno: 516,
                func: 'dispatch_queue',
                code: '                await self.process_one()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
                lineno: 81,
                func: '_run',
                code: '            self._context.run(self._callback, *self._args)\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 1859,
                func: '_run_once',
                code: '                handle._run()\n',
              },
              {
                filename:
                  '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
                lineno: 570,
                func: 'run_forever',
                code: '                self._run_once()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
                lineno: 195,
                func: 'start',
                code: '        self.asyncio_loop.run_forever()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
                lineno: 736,
                func: 'start',
                code: '                self.io_loop.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
                lineno: 1051,
                func: 'launch_instance',
                code: '        app.start()\n',
              },
              {
                filename:
                  '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
                lineno: 17,
                func: '<module>',
                code: '    app.launch_new_instance()\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 87,
                func: '_run_code',
                code: '    exec(code, run_globals)\n',
              },
              {
                filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
                lineno: 194,
                func: '_run_module_as_main',
                code: '    return _run_code(code, main_globals, None,\n',
              },
            ],
          },
          inner_calls: [],
        },
      ],
    },
  ],
};

export const MOCK_TRACE_WITH_EXEC_SEMANTICS: InterpretedCall = {
  expression: {
    expr: 'invariant',
    semantic: 'exec',
    inputs: [
      {
        kind: 'driver',
        path: ['.0'],
        snapshot: {
          kind: 'object',
          type: 'jaxlib.xla_extension.ArrayImpl',
          id: 'python/id/0x2815c3560',
          snapshot: 'Array([ 0, 42], dtype=uint32)',
        },
      },
      {
        kind: 'driver',
        path: ['.1'],
        snapshot: {
          kind: 'object',
          type: 'builtins.int',
          id: 'python/id/0x1026f1d50',
          hash: 'python/hash/0x3',
          snapshot: '3',
        },
      },
      {
        kind: 'driver',
        path: ['(free variables)', 'range'],
        snapshot: {
          kind: 'object',
          type: 'builtins.type',
          id: 'python/id/0x1026ae338',
          hash: 'python/hash/-0x7fffffffefd951cd',
          snapshot: "<class 'range'>",
        },
      },
    ],
    destination: ['PYU', 'alice'],
    outputs: [
      {
        kind: 'remote',
        path: [],
        index: 1,
        snapshot: {
          kind: 'remote_object',
          type: 'secretflow.device.device.pyu.PYUObject',
          id: 'secretflow/PYU/ray/ObjectRef(c2668a65bda616c1ffffffffffffffffffffffff0100000001000000)',
          location: ['PYU', 'alice'],
        },
      },
    ],
  },
  span_id: '0xade8e55c4274611d',
  start_time: '2023-10-25T09:37:48.071082',
  end_time: '2023-10-25T09:37:48.119138',
  call: {
    checkpoint: { api_level: 20 },
    snapshot: {
      kind: 'function',
      type: 'builtins.function',
      id: 'python/id/0x336ad9040',
      hash: 'python/hash/0x336ad904',
      module: 'secretflow.device.device.pyu',
      name: 'PYU.__call__.<locals>.wrapper',
      boundvars: {
        args: {
          kind: 'sequence',
          type: 'builtins.tuple',
          id: 'python/id/0x33529e800',
          snapshot: '(Array([ 0, 42], dtype=uint32), 3)',
          values: [
            {
              kind: 'object',
              type: 'jaxlib.xla_extension.ArrayImpl',
              id: 'python/id/0x2815c3560',
              snapshot: 'Array([ 0, 42], dtype=uint32)',
            },
            {
              kind: 'object',
              type: 'builtins.int',
              id: 'python/id/0x1026f1d50',
              hash: 'python/hash/0x3',
              snapshot: '3',
            },
          ],
        },
        kwargs: {
          kind: 'mapping',
          type: 'builtins.dict',
          id: 'python/id/0x3352b1600',
          snapshot: '{}',
          values: {},
        },
      },
      freevars: {
        fn: {
          kind: 'function',
          type: 'builtins.function',
          id: 'python/id/0x335291b80',
          hash: 'python/hash/0x335291b8',
          module: '__main__',
          name: 'balance',
          boundvars: {
            key: {
              kind: 'unbound',
              annotation: "<class 'jax._src.prng.PRNGKeyArray'>",
            },
            random_iter: { kind: 'unbound', annotation: "<class 'int'>" },
          },
          freevars: {
            range: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x1026ae338',
              hash: 'python/hash/-0x7fffffffefd951cd',
              snapshot: "<class 'range'>",
            },
            jax: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x10cdcfea0',
              hash: 'python/hash/0x10cdcfea',
              snapshot:
                "<module 'jax' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/jax/__init__.py'>",
            },
          },
          retval: { kind: 'unbound', annotation: "<class 'jax.Array'>" },
          filename: 'presets/millionaires/_algorithm.py',
          firstlineno: 15,
          source:
            'def balance(key: jax.random.KeyArray, random_iter: int) -> jax.Array:\n    for _ in range(random_iter):\n        key, subkey = jax.random.split(key)\n    return jax.random.randint(key, shape=(), minval=10**6, maxval=10**9)\n',
        },
        num_returns: {
          kind: 'object',
          type: 'builtins.NoneType',
          id: 'python/id/0x1026e94f0',
          hash: 'python/hash/0x1026e94f',
          snapshot: 'None',
        },
        self: {
          kind: 'remote_location',
          type: 'secretflow.device.device.pyu.PYU',
          id: 'python/id/0x29f011970',
          location: ['PYU', 'alice'],
        },
        jax: {
          kind: 'object',
          type: 'builtins.module',
          id: 'python/id/0x10cdcfea0',
          hash: 'python/hash/0x10cdcfea',
          snapshot:
            "<module 'jax' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/jax/__init__.py'>",
        },
        check_num_returns: {
          kind: 'function',
          type: 'builtins.function',
          id: 'python/id/0x17fcf2c10',
          hash: 'python/hash/0x17fcf2c1',
          module: 'secretflow.device.device._utils',
          name: 'check_num_returns',
          boundvars: { fn: { kind: 'unbound', annotation: 'typing.Any' } },
          freevars: {
            inspect: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x102989270',
              hash: 'python/hash/0x10298927',
              snapshot:
                "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
            },
            hasattr: {
              kind: 'object',
              type: 'builtins.builtin_function_or_method',
              id: 'python/id/0x1007789f0',
              hash: 'python/hash/0x27a154',
              snapshot: '<built-in function hasattr>',
            },
            len: {
              kind: 'object',
              type: 'builtins.builtin_function_or_method',
              id: 'python/id/0x100778c70',
              hash: 'python/hash/0x400000000027a1e0',
              snapshot: '<built-in function len>',
            },
            isinstance: {
              kind: 'object',
              type: 'builtins.builtin_function_or_method',
              id: 'python/id/0x100778b80',
              hash: 'python/hash/0x27a186',
              snapshot: '<built-in function isinstance>',
            },
            tuple: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x1026e54a0',
              hash: 'python/hash/0x1026e54a',
              snapshot: "<class 'tuple'>",
            },
          },
          retval: { kind: 'unbound', annotation: 'typing.Any' },
          filename:
            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/_utils.py',
          firstlineno: 4,
          source:
            "def check_num_returns(fn):\n    # inspect.signature fails on some builtin method (e.g. numpy.random.rand).\n    # You can wrap a self define function which calls builtin function inside\n    # with return annotation to get multi returns for now.\n    if inspect.isbuiltin(fn):\n        sig = inspect.signature(lambda *arg, **kwargs: fn(*arg, **kwargs))\n    else:\n        sig = inspect.signature(fn)\n\n    if sig.return_annotation is None or sig.return_annotation == sig.empty:\n        num_returns = 1\n    else:\n        if (\n            hasattr(sig.return_annotation, '_name')\n            and sig.return_annotation._name == 'Tuple'\n        ):\n            num_returns = len(sig.return_annotation.__args__)\n        elif isinstance(sig.return_annotation, tuple):\n            num_returns = len(sig.return_annotation)\n        else:\n            num_returns = 1\n\n    return num_returns\n",
        },
        sfd: {
          kind: 'object',
          type: 'builtins.module',
          id: 'python/id/0x17fb8a450',
          hash: 'python/hash/0x17fb8a45',
          snapshot:
            "<module 'secretflow.distributed' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/__init__.py'>",
        },
        logging: {
          kind: 'object',
          type: 'builtins.module',
          id: 'python/id/0x101987db0',
          hash: 'python/hash/0x101987db',
          snapshot:
            "<module 'logging' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/logging/__init__.py'>",
        },
        len: {
          kind: 'object',
          type: 'builtins.builtin_function_or_method',
          id: 'python/id/0x100778c70',
          hash: 'python/hash/0x400000000027a1e0',
          snapshot: '<built-in function len>',
        },
        PYUObject: {
          kind: 'object',
          type: 'abc.ABCMeta',
          id: 'python/id/0x13e0f0320',
          hash: 'python/hash/0x13e0f032',
          snapshot: "<class 'secretflow.device.device.pyu.PYUObject'>",
        },
      },
      retval: {
        kind: 'remote_object',
        type: 'secretflow.device.device.pyu.PYUObject',
        id: 'secretflow/PYU/ray/ObjectRef(c2668a65bda616c1ffffffffffffffffffffffff0100000001000000)',
        location: ['PYU', 'alice'],
      },
      filename:
        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
      firstlineno: 83,
      source:
        "def wrapper(*args, **kwargs):\n    def try_get_data(arg, device):\n        if isinstance(arg, DeviceObject):\n            assert (\n                arg.device == device\n            ), f\"receive tensor {arg} in different device\"\n            return arg.data\n        return arg\n\n    args_, kwargs_ = jax.tree_util.tree_map(\n        lambda arg: try_get_data(arg, self), (args, kwargs)\n    )\n\n    _num_returns = check_num_returns(fn) if num_returns is None else num_returns\n    data = (\n        sfd.remote(self._run)\n        .party(self.party)\n        .options(num_returns=_num_returns)\n        .remote(fn, *args_, **kwargs_)\n    )\n    logging.debug(\n        (\n            f'PYU remote function: {fn}, num_returns={num_returns}, '\n            f'args len: {len(args)}, kwargs len: {len(kwargs)}.'\n        )\n    )\n    if _num_returns == 1:\n        return PYUObject(self, data)\n    else:\n        return [PYUObject(self, datum) for datum in data]\n",
    },
    stackframes: [
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
        lineno: 83,
        func: 'wrapper',
        code: '        def wrapper(*args, **kwargs):\n',
      },
      {
        filename: 'presets/millionaires/_algorithm.py',
        lineno: 25,
        func: '<module>',
        code: 'balance_alice = devices(PYU, "alice")(balance)(key, 3)\n',
      },
      {
        filename: 'Cell In[3]',
        lineno: 35,
        func: '<module>',
        code: '        exec(_algorithm, globals())\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3508,
        func: 'run_code',
        code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3448,
        func: 'run_ast_nodes',
        code: '                if await self.run_code(code, result, async_=asy):\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3269,
        func: 'run_cell_async',
        code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
        lineno: 129,
        func: '_pseudo_sync_runner',
        code: '        coro.send(None)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3064,
        func: '_run_cell',
        code: '            result = runner(coro)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3009,
        func: 'run_cell',
        code: '            result = self._run_cell(\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
        lineno: 546,
        func: 'run_cell',
        code: '        return super().run_cell(*args, **kwargs)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
        lineno: 422,
        func: 'do_execute',
        code: '                    res = shell.run_cell(\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 740,
        func: 'execute_request',
        code: '            reply_content = await reply_content\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 412,
        func: 'dispatch_shell',
        code: '                    await result\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 505,
        func: 'process_one',
        code: '        await dispatch(*args)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 516,
        func: 'dispatch_queue',
        code: '                await self.process_one()\n',
      },
      {
        filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
        lineno: 81,
        func: '_run',
        code: '            self._context.run(self._callback, *self._args)\n',
      },
      {
        filename:
          '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
        lineno: 1859,
        func: '_run_once',
        code: '                handle._run()\n',
      },
      {
        filename:
          '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
        lineno: 570,
        func: 'run_forever',
        code: '                self._run_once()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
        lineno: 195,
        func: 'start',
        code: '        self.asyncio_loop.run_forever()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
        lineno: 736,
        func: 'start',
        code: '                self.io_loop.start()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
        lineno: 1051,
        func: 'launch_instance',
        code: '        app.start()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
        lineno: 17,
        func: '<module>',
        code: '    app.launch_new_instance()\n',
      },
      {
        filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
        lineno: 87,
        func: '_run_code',
        code: '    exec(code, run_globals)\n',
      },
      {
        filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
        lineno: 194,
        func: '_run_module_as_main',
        code: '    return _run_code(code, main_globals, None,\n',
      },
    ],
  },
  inner_calls: [
    {
      span_id: '0xad849a531d22b167',
      start_time: '2023-10-25T09:37:48.080495',
      end_time: '2023-10-25T09:37:48.080937',
      call: {
        checkpoint: { api_level: 10 },
        snapshot: {
          kind: 'function',
          type: 'builtins.function',
          id: 'python/id/0x10b314700',
          hash: 'python/hash/0x10b31470',
          module: 'ray._private.worker',
          name: 'get',
          boundvars: {
            object_refs: {
              kind: 'sequence',
              type: 'builtins.list',
              id: 'python/id/0x335288d40',
              snapshot: '[]',
              values: [],
            },
            timeout: {
              kind: 'object',
              type: 'builtins.NoneType',
              id: 'python/id/0x1026e94f0',
              hash: 'python/hash/0x1026e94f',
              snapshot: 'None',
            },
          },
          freevars: {
            global_worker: {
              kind: 'object',
              type: 'ray._private.worker.Worker',
              id: 'python/id/0x10b2ffe20',
              hash: 'python/hash/0x10b2ffe2',
              snapshot: '<ray._private.worker.Worker object at 0x10b2ffe20>',
            },
            hasattr: {
              kind: 'object',
              type: 'builtins.builtin_function_or_method',
              id: 'python/id/0x1007789f0',
              hash: 'python/hash/0x27a154',
              snapshot: '<built-in function hasattr>',
            },
            blocking_get_inside_async_warned: {
              kind: 'object',
              type: 'builtins.bool',
              id: 'python/id/0x1026e8cd8',
              hash: 'python/hash/0x0',
              snapshot: 'False',
            },
            logger: {
              kind: 'object',
              type: 'logging.Logger',
              id: 'python/id/0x10ac641f0',
              hash: 'python/hash/0x10ac641f',
              snapshot: '<Logger ray._private.worker (INFO)>',
            },
            profiling: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x10aaecc70',
              hash: 'python/hash/0x10aaecc7',
              snapshot:
                "<module 'ray._private.profiling' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/profiling.py'>",
            },
            isinstance: {
              kind: 'object',
              type: 'builtins.builtin_function_or_method',
              id: 'python/id/0x100778b80',
              hash: 'python/hash/0x27a186',
              snapshot: '<built-in function isinstance>',
            },
            StreamingObjectRefGenerator: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x13e02ec10',
              hash: 'python/hash/0x13e02ec1',
              snapshot: "<class 'ray._raylet.StreamingObjectRefGenerator'>",
            },
            ray: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x105576ef0',
              hash: 'python/hash/0x105576ef',
              snapshot:
                "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
            },
            list: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x1026e9100',
              hash: 'python/hash/0x1026e910',
              snapshot: "<class 'list'>",
            },
            ValueError: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x10269d740',
              hash: 'python/hash/0x10269d74',
              snapshot: "<class 'ValueError'>",
            },
            enumerate: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x1026adff8',
              hash: 'python/hash/-0x7fffffffefd95201',
              snapshot: "<class 'enumerate'>",
            },
            RayError: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x13e13fd00',
              hash: 'python/hash/0x13e13fd0',
              snapshot: "<class 'ray.exceptions.RayError'>",
            },
            RayTaskError: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x13d625ff0',
              hash: 'python/hash/0x13d625ff',
              snapshot: "<class 'ray.exceptions.RayTaskError'>",
            },
            sys: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x10076cea0',
              hash: 'python/hash/0x10076cea',
              snapshot: "<module 'sys' (built-in)>",
            },
          },
          retval: {
            kind: 'sequence',
            type: 'builtins.list',
            id: 'python/id/0x336adc940',
            snapshot: '[]',
            values: [],
          },
          filename:
            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/worker.py',
          firstlineno: 2439,
          source:
            '@PublicAPI\n@client_mode_hook\ndef get(\n    object_refs: Union[ray.ObjectRef, Sequence[ray.ObjectRef]],\n    *,\n    timeout: Optional[float] = None,\n) -> Union[Any, List[Any]]:\n    """Get a remote object or a list of remote objects from the object store.\n\n    This method blocks until the object corresponding to the object ref is\n    available in the local object store. If this object is not in the local\n    object store, it will be shipped from an object store that has it (once the\n    object has been created). If object_refs is a list, then the objects\n    corresponding to each object in the list will be returned.\n\n    Ordering for an input list of object refs is preserved for each object\n    returned. That is, if an object ref to A precedes an object ref to B in the\n    input list, then A will precede B in the returned list.\n\n    This method will issue a warning if it\'s running inside async context,\n    you can use ``await object_ref`` instead of ``ray.get(object_ref)``. For\n    a list of object refs, you can use ``await asyncio.gather(*object_refs)``.\n\n    Related patterns and anti-patterns:\n\n    - :doc:`/ray-core/patterns/ray-get-loop`\n    - :doc:`/ray-core/patterns/unnecessary-ray-get`\n    - :doc:`/ray-core/patterns/ray-get-submission-order`\n    - :doc:`/ray-core/patterns/ray-get-too-many-objects`\n\n\n    Args:\n        object_refs: Object ref of the object to get or a list of object refs\n            to get.\n        timeout (Optional[float]): The maximum amount of time in seconds to\n            wait before returning. Set this to None will block until the\n            corresponding object becomes available. Setting ``timeout=0`` will\n            return the object immediately if it\'s available, else raise\n            GetTimeoutError in accordance with the above docstring.\n\n    Returns:\n        A Python object or a list of Python objects.\n\n    Raises:\n        GetTimeoutError: A GetTimeoutError is raised if a timeout is set and\n            the get takes longer than timeout to return.\n        Exception: An exception is raised if the task that created the object\n            or that created one of the objects raised an exception.\n    """\n    worker = global_worker\n    worker.check_connected()\n\n    if hasattr(worker, "core_worker") and worker.core_worker.current_actor_is_asyncio():\n        global blocking_get_inside_async_warned\n        if not blocking_get_inside_async_warned:\n            logger.warning(\n                "Using blocking ray.get inside async actor. "\n                "This blocks the event loop. Please use `await` "\n                "on object ref with asyncio.gather if you want to "\n                "yield execution to the event loop instead."\n            )\n            blocking_get_inside_async_warned = True\n\n    with profiling.profile("ray.get"):\n        # TODO(sang): Should make StreamingObjectRefGenerator\n        # compatible to ray.get for dataset.\n        if isinstance(object_refs, StreamingObjectRefGenerator):\n            return object_refs\n\n        is_individual_id = isinstance(object_refs, ray.ObjectRef)\n        if is_individual_id:\n            object_refs = [object_refs]\n\n        if not isinstance(object_refs, list):\n            raise ValueError(\n                "\'object_refs\' must either be an ObjectRef or a list of ObjectRefs."\n            )\n\n        # TODO(ujvl): Consider how to allow user to retrieve the ready objects.\n        values, debugger_breakpoint = worker.get_objects(object_refs, timeout=timeout)\n        for i, value in enumerate(values):\n            if isinstance(value, RayError):\n                if isinstance(value, ray.exceptions.ObjectLostError):\n                    worker.core_worker.dump_object_store_memory_usage()\n                if isinstance(value, RayTaskError):\n                    raise value.as_instanceof_cause()\n                else:\n                    raise value\n\n        if is_individual_id:\n            values = values[0]\n\n        if debugger_breakpoint != b"":\n            frame = sys._getframe().f_back\n            rdb = ray.util.pdb._connect_ray_pdb(\n                host=None,\n                port=None,\n                patch_stdstreams=False,\n                quiet=None,\n                breakpoint_uuid=debugger_breakpoint.decode()\n                if debugger_breakpoint\n                else None,\n                debugger_external=worker.ray_debugger_external,\n            )\n            rdb.set_trace(frame=frame)\n\n        return values\n',
          docstring:
            "Get a remote object or a list of remote objects from the object store.\n\nThis method blocks until the object corresponding to the object ref is\navailable in the local object store. If this object is not in the local\nobject store, it will be shipped from an object store that has it (once the\nobject has been created). If object_refs is a list, then the objects\ncorresponding to each object in the list will be returned.\n\nOrdering for an input list of object refs is preserved for each object\nreturned. That is, if an object ref to A precedes an object ref to B in the\ninput list, then A will precede B in the returned list.\n\nThis method will issue a warning if it's running inside async context,\nyou can use ``await object_ref`` instead of ``ray.get(object_ref)``. For\na list of object refs, you can use ``await asyncio.gather(*object_refs)``.\n\nRelated patterns and anti-patterns:\n\n- :doc:`/ray-core/patterns/ray-get-loop`\n- :doc:`/ray-core/patterns/unnecessary-ray-get`\n- :doc:`/ray-core/patterns/ray-get-submission-order`\n- :doc:`/ray-core/patterns/ray-get-too-many-objects`\n\n\nArgs:\n    object_refs: Object ref of the object to get or a list of object refs\n        to get.\n    timeout (Optional[float]): The maximum amount of time in seconds to\n        wait before returning. Set this to None will block until the\n        corresponding object becomes available. Setting ``timeout=0`` will\n        return the object immediately if it's available, else raise\n        GetTimeoutError in accordance with the above docstring.\n\nReturns:\n    A Python object or a list of Python objects.\n\nRaises:\n    GetTimeoutError: A GetTimeoutError is raised if a timeout is set and\n        the get takes longer than timeout to return.\n    Exception: An exception is raised if the task that created the object\n        or that created one of the objects raised an exception.",
        },
        stackframes: [
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/worker.py',
            lineno: 2439,
            func: 'get',
            code: '@PublicAPI\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
            lineno: 103,
            func: 'wrapper',
            code: '        return func(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/auto_init_hook.py',
            lineno: 24,
            func: 'auto_init_wrapper',
            code: '        return fn(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
            lineno: 97,
            func: '_resolve_args',
            code: '    actual_vals = ray.get(list(refs.values()))\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
            lineno: 107,
            func: '_remote',
            code: '        args, kwargs = _resolve_args(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
            lineno: 230,
            func: 'remote',
            code: '                return func_cls._remote(args=args, kwargs=kwargs, **updated_options)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
            lineno: 98,
            func: 'wrapper',
            code: '                sfd.remote(self._run)\n',
          },
          {
            filename: 'presets/millionaires/_algorithm.py',
            lineno: 25,
            func: '<module>',
            code: 'balance_alice = devices(PYU, "alice")(balance)(key, 3)\n',
          },
          {
            filename: 'Cell In[3]',
            lineno: 35,
            func: '<module>',
            code: '        exec(_algorithm, globals())\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3508,
            func: 'run_code',
            code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3448,
            func: 'run_ast_nodes',
            code: '                if await self.run_code(code, result, async_=asy):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3269,
            func: 'run_cell_async',
            code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
            lineno: 129,
            func: '_pseudo_sync_runner',
            code: '        coro.send(None)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3064,
            func: '_run_cell',
            code: '            result = runner(coro)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3009,
            func: 'run_cell',
            code: '            result = self._run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
            lineno: 546,
            func: 'run_cell',
            code: '        return super().run_cell(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
            lineno: 422,
            func: 'do_execute',
            code: '                    res = shell.run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 740,
            func: 'execute_request',
            code: '            reply_content = await reply_content\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 412,
            func: 'dispatch_shell',
            code: '                    await result\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 505,
            func: 'process_one',
            code: '        await dispatch(*args)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 516,
            func: 'dispatch_queue',
            code: '                await self.process_one()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
            lineno: 81,
            func: '_run',
            code: '            self._context.run(self._callback, *self._args)\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 1859,
            func: '_run_once',
            code: '                handle._run()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 570,
            func: 'run_forever',
            code: '                self._run_once()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
            lineno: 195,
            func: 'start',
            code: '        self.asyncio_loop.run_forever()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
            lineno: 736,
            func: 'start',
            code: '                self.io_loop.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
            lineno: 1051,
            func: 'launch_instance',
            code: '        app.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
            lineno: 17,
            func: '<module>',
            code: '    app.launch_new_instance()\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 87,
            func: '_run_code',
            code: '    exec(code, run_globals)\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 194,
            func: '_run_module_as_main',
            code: '    return _run_code(code, main_globals, None,\n',
          },
        ],
      },
      inner_calls: [],
    },
    {
      span_id: '0x768629c1b4ce1e83',
      start_time: '2023-10-25T09:37:48.106147',
      end_time: '2023-10-25T09:37:48.116309',
      call: {
        checkpoint: { api_level: 10 },
        snapshot: {
          kind: 'function',
          type: 'builtins.function',
          id: 'python/id/0x10b2c2c10',
          hash: 'python/hash/0x10b2c2c1',
          module: 'ray.remote_function',
          name: 'RemoteFunction._remote',
          boundvars: {
            self: {
              kind: 'object',
              type: 'secretflow.distributed.primitive.RemoteFunctionWrapper',
              id: 'python/id/0x3352ea7f0',
              hash: 'python/hash/0x3352ea7f',
              snapshot:
                '<secretflow.distributed.primitive.RemoteFunctionWrapper object at 0x3352ea7f0>',
            },
            args: {
              kind: 'sequence',
              type: 'builtins.tuple',
              id: 'python/id/0x33526bb80',
              snapshot:
                '(<function balance at 0x335291b80>, Array([ 0, 42], dtype=uint32), 3)',
              values: [
                {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x335291b80',
                  hash: 'python/hash/0x335291b8',
                  module: '__main__',
                  name: 'balance',
                  boundvars: {
                    key: {
                      kind: 'unbound',
                      annotation: "<class 'jax._src.prng.PRNGKeyArray'>",
                    },
                    random_iter: {
                      kind: 'unbound',
                      annotation: "<class 'int'>",
                    },
                  },
                  freevars: {
                    range: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x1026ae338',
                      hash: 'python/hash/-0x7fffffffefd951cd',
                      snapshot: "<class 'range'>",
                    },
                    jax: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x10cdcfea0',
                      hash: 'python/hash/0x10cdcfea',
                      snapshot:
                        "<module 'jax' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/jax/__init__.py'>",
                    },
                  },
                  retval: {
                    kind: 'unbound',
                    annotation: "<class 'jax.Array'>",
                  },
                  filename: 'presets/millionaires/_algorithm.py',
                  firstlineno: 15,
                  source:
                    'def balance(key: jax.random.KeyArray, random_iter: int) -> jax.Array:\n    for _ in range(random_iter):\n        key, subkey = jax.random.split(key)\n    return jax.random.randint(key, shape=(), minval=10**6, maxval=10**9)\n',
                },
                {
                  kind: 'object',
                  type: 'jaxlib.xla_extension.ArrayImpl',
                  id: 'python/id/0x2815c3560',
                  snapshot: 'Array([ 0, 42], dtype=uint32)',
                },
                {
                  kind: 'object',
                  type: 'builtins.int',
                  id: 'python/id/0x1026f1d50',
                  hash: 'python/hash/0x3',
                  snapshot: '3',
                },
              ],
            },
            kwargs: {
              kind: 'mapping',
              type: 'builtins.dict',
              id: 'python/id/0x336adce40',
              snapshot: '{}',
              values: {},
            },
            task_options: {
              kind: 'mapping',
              type: 'builtins.dict',
              id: 'python/id/0x3352fa080',
              snapshot: "{'num_returns': 1, 'resources': {'alice': 1}}",
              values: {
                num_returns: {
                  kind: 'object',
                  type: 'builtins.int',
                  id: 'python/id/0x1026f1d10',
                  hash: 'python/hash/0x1',
                  snapshot: '1',
                },
                resources: {
                  kind: 'mapping',
                  type: 'builtins.dict',
                  id: 'python/id/0x335278f80',
                  snapshot: "{'alice': 1}",
                  values: {
                    alice: {
                      kind: 'object',
                      type: 'builtins.int',
                      id: 'python/id/0x1026f1d10',
                      hash: 'python/hash/0x1',
                      snapshot: '1',
                    },
                  },
                },
              },
            },
          },
          freevars: {
            auto_init_ray: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10a9629d0',
              hash: 'python/hash/0x10a9629d',
              module: 'ray._private.auto_init_hook',
              name: 'auto_init_ray',
              boundvars: {},
              freevars: {
                os: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x100826590',
                  hash: 'python/hash/0x10082659',
                  snapshot:
                    "<module 'os' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/os.py'>",
                },
                ray: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x105576ef0',
                  hash: 'python/hash/0x105576ef',
                  snapshot:
                    "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                },
                auto_init_lock: {
                  kind: 'object',
                  type: '_thread.lock',
                  id: 'python/id/0x10a9619f0',
                  hash: 'python/hash/0x10a9619f',
                  snapshot: '<unlocked _thread.lock object at 0x10a9619f0>',
                },
              },
              retval: { kind: 'unbound', annotation: 'typing.Any' },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/auto_init_hook.py',
              firstlineno: 9,
              source:
                'def auto_init_ray():\n    if (\n        os.environ.get("RAY_ENABLE_AUTO_CONNECT", "") != "0"\n        and not ray.is_initialized()\n    ):\n        auto_init_lock.acquire()\n        if not ray.is_initialized():\n            ray.init()\n        auto_init_lock.release()\n',
            },
            client_mode_should_convert: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10a9650d0',
              hash: 'python/hash/0x10a9650d',
              module: 'ray._private.client_mode_hook',
              name: 'client_mode_should_convert',
              boundvars: {},
              freevars: {
                is_client_mode_enabled: {
                  kind: 'object',
                  type: 'builtins.bool',
                  id: 'python/id/0x1026e8cd8',
                  hash: 'python/hash/0x0',
                  snapshot: 'False',
                },
                is_client_mode_enabled_by_default: {
                  kind: 'object',
                  type: 'builtins.bool',
                  id: 'python/id/0x1026e8cd8',
                  hash: 'python/hash/0x0',
                  snapshot: 'False',
                },
                _get_client_hook_status_on_thread: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10a962940',
                  hash: 'python/hash/0x10a96294',
                  module: 'ray._private.client_mode_hook',
                  name: '_get_client_hook_status_on_thread',
                  boundvars: {},
                  freevars: {
                    hasattr: {
                      kind: 'object',
                      type: 'builtins.builtin_function_or_method',
                      id: 'python/id/0x1007789f0',
                      hash: 'python/hash/0x27a154',
                      snapshot: '<built-in function hasattr>',
                    },
                    _client_hook_status_on_thread: {
                      kind: 'object',
                      type: '_thread._local',
                      id: 'python/id/0x10a9608b0',
                      hash: 'python/hash/0x10a9608b',
                      snapshot: '<_thread._local object at 0x10a9608b0>',
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                  firstlineno: 27,
                  source:
                    'def _get_client_hook_status_on_thread():\n    """Get\'s the value of `_client_hook_status_on_thread`.\n    Since `_client_hook_status_on_thread` is a thread-local variable, we may\n    need to add and set the \'status\' attribute.\n    """\n    global _client_hook_status_on_thread\n    if not hasattr(_client_hook_status_on_thread, "status"):\n        _client_hook_status_on_thread.status = True\n    return _client_hook_status_on_thread.status\n',
                  docstring:
                    "Get's the value of `_client_hook_status_on_thread`.\nSince `_client_hook_status_on_thread` is a thread-local variable, we may\nneed to add and set the 'status' attribute.",
                },
              },
              retval: { kind: 'unbound', annotation: 'typing.Any' },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
              firstlineno: 108,
              source:
                'def client_mode_should_convert():\n    """Determines if functions should be converted to client mode."""\n\n    # `is_client_mode_enabled_by_default` is used for testing with\n    # `RAY_CLIENT_MODE=1`. This flag means all tests run with client mode.\n    return (\n        is_client_mode_enabled or is_client_mode_enabled_by_default\n    ) and _get_client_hook_status_on_thread()\n',
              docstring: 'Determines if functions should be converted to client mode.',
            },
            client_mode_convert_function: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10a9651f0',
              hash: 'python/hash/0x10a9651f',
              module: 'ray._private.client_mode_hook',
              name: 'client_mode_convert_function',
              boundvars: {
                func_cls: { kind: 'unbound', annotation: 'typing.Any' },
                in_args: { kind: 'unbound', annotation: 'typing.Any' },
                in_kwargs: { kind: 'unbound', annotation: 'typing.Any' },
                kwargs: { kind: 'unbound', annotation: 'typing.Any' },
              },
              freevars: {
                getattr: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778950',
                  hash: 'python/hash/0x400000000027a162',
                  snapshot: '<built-in function getattr>',
                },
                RAY_CLIENT_MODE_ATTR: {
                  kind: 'object',
                  type: 'builtins.str',
                  id: 'python/id/0x10a960260',
                  hash: 'python/hash/-0x4a78f7bc06cfd03c',
                  snapshot: "'__ray_client_mode_key__'",
                },
                setattr: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x10077a040',
                  hash: 'python/hash/-0x3fffffffffd85c5f',
                  snapshot: '<built-in function setattr>',
                },
              },
              retval: { kind: 'unbound', annotation: 'typing.Any' },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
              firstlineno: 146,
              source:
                'def client_mode_convert_function(func_cls, in_args, in_kwargs, **kwargs):\n    """Runs a preregistered ray RemoteFunction through the ray client.\n\n    The common case for this is to transparently convert that RemoteFunction\n    to a ClientRemoteFunction. This happens in circumstances where the\n    RemoteFunction is declared early, in a library and only then is Ray used in\n    client mode -- necessitating a conversion.\n    """\n    from ray.util.client import ray\n\n    key = getattr(func_cls, RAY_CLIENT_MODE_ATTR, None)\n\n    # Second part of "or" is needed in case func_cls is reused between Ray\n    # client sessions in one Python interpreter session.\n    if (key is None) or (not ray._converted_key_exists(key)):\n        key = ray._convert_function(func_cls)\n        setattr(func_cls, RAY_CLIENT_MODE_ATTR, key)\n    client_func = ray._get_converted(key)\n    return client_func._remote(in_args, in_kwargs, **kwargs)\n',
              docstring:
                'Runs a preregistered ray RemoteFunction through the ray client.\n\nThe common case for this is to transparently convert that RemoteFunction\nto a ClientRemoteFunction. This happens in circumstances where the\nRemoteFunction is declared early, in a library and only then is Ray used in\nclient mode -- necessitating a conversion.',
            },
            ray: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x105576ef0',
              hash: 'python/hash/0x105576ef',
              snapshot:
                "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
            },
            PythonFunctionDescriptor: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x128e110d8',
              hash: 'python/hash/-0x7fffffffed71eef3',
              snapshot: "<class 'ray._raylet.PythonFunctionDescriptor'>",
            },
            pickle_dumps: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10adec0d0',
              hash: 'python/hash/0x10adec0d',
              module: 'ray._private.serialization',
              name: 'pickle_dumps',
              boundvars: {
                obj: { kind: 'unbound', annotation: 'typing.Any' },
                error_msg: { kind: 'unbound', annotation: "<class 'str'>" },
              },
              freevars: {
                pickle: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x10565a8b0',
                  hash: 'python/hash/0x10565a8b',
                  snapshot:
                    "<module 'ray.cloudpickle' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/cloudpickle/__init__.py'>",
                },
                TypeError: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x102699ab0',
                  hash: 'python/hash/0x102699ab',
                  snapshot: "<class 'TypeError'>",
                },
                io: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x1008129f0',
                  hash: 'python/hash/0x1008129f',
                  snapshot:
                    "<module 'io' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/io.py'>",
                },
                inspect_serializability: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aad4670',
                  hash: 'python/hash/0x10aad467',
                  module: 'ray.util.check_serialize',
                  name: 'inspect_serializability',
                  boundvars: {
                    base_obj: { kind: 'unbound', annotation: 'typing.Any' },
                    name: {
                      kind: 'object',
                      type: 'builtins.NoneType',
                      id: 'python/id/0x1026e94f0',
                      hash: 'python/hash/0x1026e94f',
                      snapshot: 'None',
                    },
                    depth: {
                      kind: 'object',
                      type: 'builtins.int',
                      id: 'python/id/0x1026f1d50',
                      hash: 'python/hash/0x3',
                      snapshot: '3',
                    },
                    print_file: {
                      kind: 'object',
                      type: 'builtins.NoneType',
                      id: 'python/id/0x1026e94f0',
                      hash: 'python/hash/0x1026e94f',
                      snapshot: 'None',
                    },
                  },
                  freevars: {
                    _Printer: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x13e13e220',
                      hash: 'python/hash/0x13e13e22',
                      snapshot: "<class 'ray.util.check_serialize._Printer'>",
                    },
                    _inspect_serializability: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aad4700',
                      hash: 'python/hash/0x10aad470',
                      module: 'ray.util.check_serialize',
                      name: '_inspect_serializability',
                      boundvars: {
                        base_obj: { kind: 'unbound', annotation: 'typing.Any' },
                        name: { kind: 'unbound', annotation: 'typing.Any' },
                        depth: { kind: 'unbound', annotation: 'typing.Any' },
                        parent: { kind: 'unbound', annotation: 'typing.Any' },
                        failure_set: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        printer: { kind: 'unbound', annotation: 'typing.Any' },
                      },
                      freevars: {
                        colorama: {
                          kind: 'object',
                          type: 'builtins.module',
                          id: 'python/id/0x105641720',
                          hash: 'python/hash/0x10564172',
                          snapshot:
                            "<module 'colorama' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/thirdparty_files/colorama/__init__.py'>",
                        },
                        set: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x1026c9cb8',
                          hash: 'python/hash/-0x7fffffffefd93635',
                          snapshot: "<class 'set'>",
                        },
                        min: {
                          kind: 'object',
                          type: 'builtins.builtin_function_or_method',
                          id: 'python/id/0x100778d60',
                          hash: 'python/hash/0x400000000027a242',
                          snapshot: '<built-in function min>',
                        },
                        len: {
                          kind: 'object',
                          type: 'builtins.builtin_function_or_method',
                          id: 'python/id/0x100778c70',
                          hash: 'python/hash/0x400000000027a1e0',
                          snapshot: '<built-in function len>',
                        },
                        str: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x1026e5300',
                          hash: 'python/hash/0x1026e530',
                          snapshot: "<class 'str'>",
                        },
                        cp: {
                          kind: 'object',
                          type: 'builtins.module',
                          id: 'python/id/0x10565a8b0',
                          hash: 'python/hash/0x10565a8b',
                          snapshot:
                            "<module 'ray.cloudpickle' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/cloudpickle/__init__.py'>",
                        },
                        Exception: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x102699910',
                          hash: 'python/hash/0x10269991',
                          snapshot: "<class 'Exception'>",
                        },
                        FailureTuple: {
                          kind: 'object',
                          type: 'builtins.type',
                          id: 'python/id/0x13e13e700',
                          hash: 'python/hash/0x13e13e70',
                          snapshot: "<class 'ray.util.check_serialize.FailureTuple'>",
                        },
                        inspect: {
                          kind: 'object',
                          type: 'builtins.module',
                          id: 'python/id/0x102989270',
                          hash: 'python/hash/0x10298927',
                          snapshot:
                            "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                        },
                        _inspect_func_serialization: {
                          kind: 'function',
                          type: 'builtins.function',
                          id: 'python/id/0x10aad4280',
                          hash: 'python/hash/0x10aad428',
                          module: 'ray.util.check_serialize',
                          name: '_inspect_func_serialization',
                          boundvars: {
                            base_obj: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            depth: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            parent: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            failure_set: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            printer: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                          },
                          freevars: {
                            inspect: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x102989270',
                              hash: 'python/hash/0x10298927',
                              snapshot:
                                "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                            },
                            AssertionError: {
                              kind: 'object',
                              type: 'builtins.type',
                              id: 'python/id/0x10269df60',
                              hash: 'python/hash/0x10269df6',
                              snapshot: "<class 'AssertionError'>",
                            },
                            len: {
                              kind: 'object',
                              type: 'builtins.builtin_function_or_method',
                              id: 'python/id/0x100778c70',
                              hash: 'python/hash/0x400000000027a1e0',
                              snapshot: '<built-in function len>',
                            },
                            _inspect_serializability: {
                              kind: 'ref',
                              id: 'python/id/0x10aad4700',
                            },
                          },
                          retval: { kind: 'unbound', annotation: 'typing.Any' },
                          filename:
                            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                          firstlineno: 52,
                          source:
                            'def _inspect_func_serialization(base_obj, depth, parent, failure_set, printer):\n    """Adds the first-found non-serializable element to the failure_set."""\n    assert inspect.isfunction(base_obj)\n    closure = inspect.getclosurevars(base_obj)\n    found = False\n    if closure.globals:\n        printer.print(\n            f"Detected {len(closure.globals)} global variables. "\n            "Checking serializability..."\n        )\n\n        with printer.indent():\n            for name, obj in closure.globals.items():\n                serializable, _ = _inspect_serializability(\n                    obj,\n                    name=name,\n                    depth=depth - 1,\n                    parent=parent,\n                    failure_set=failure_set,\n                    printer=printer,\n                )\n                found = found or not serializable\n                if found:\n                    break\n\n    if closure.nonlocals:\n        printer.print(\n            f"Detected {len(closure.nonlocals)} nonlocal variables. "\n            "Checking serializability..."\n        )\n        with printer.indent():\n            for name, obj in closure.nonlocals.items():\n                serializable, _ = _inspect_serializability(\n                    obj,\n                    name=name,\n                    depth=depth - 1,\n                    parent=parent,\n                    failure_set=failure_set,\n                    printer=printer,\n                )\n                found = found or not serializable\n                if found:\n                    break\n    if not found:\n        printer.print(\n            f"WARNING: Did not find non-serializable object in {base_obj}. "\n            "This may be an oversight."\n        )\n    return found\n',
                          docstring:
                            'Adds the first-found non-serializable element to the failure_set.',
                        },
                        _inspect_generic_serialization: {
                          kind: 'function',
                          type: 'builtins.function',
                          id: 'python/id/0x10aad45e0',
                          hash: 'python/hash/0x10aad45e',
                          module: 'ray.util.check_serialize',
                          name: '_inspect_generic_serialization',
                          boundvars: {
                            base_obj: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            depth: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            parent: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            failure_set: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                            printer: {
                              kind: 'unbound',
                              annotation: 'typing.Any',
                            },
                          },
                          freevars: {
                            inspect: {
                              kind: 'object',
                              type: 'builtins.module',
                              id: 'python/id/0x102989270',
                              hash: 'python/hash/0x10298927',
                              snapshot:
                                "<module 'inspect' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/inspect.py'>",
                            },
                            AssertionError: {
                              kind: 'object',
                              type: 'builtins.type',
                              id: 'python/id/0x10269df60',
                              hash: 'python/hash/0x10269df6',
                              snapshot: "<class 'AssertionError'>",
                            },
                            _inspect_serializability: {
                              kind: 'ref',
                              id: 'python/id/0x10aad4700',
                            },
                          },
                          retval: { kind: 'unbound', annotation: 'typing.Any' },
                          filename:
                            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                          firstlineno: 103,
                          source:
                            'def _inspect_generic_serialization(base_obj, depth, parent, failure_set, printer):\n    """Adds the first-found non-serializable element to the failure_set."""\n    assert not inspect.isfunction(base_obj)\n    functions = inspect.getmembers(base_obj, predicate=inspect.isfunction)\n    found = False\n    with printer.indent():\n        for name, obj in functions:\n            serializable, _ = _inspect_serializability(\n                obj,\n                name=name,\n                depth=depth - 1,\n                parent=parent,\n                failure_set=failure_set,\n                printer=printer,\n            )\n            found = found or not serializable\n            if found:\n                break\n\n    with printer.indent():\n        members = inspect.getmembers(base_obj)\n        for name, obj in members:\n            if name.startswith("__") and name.endswith("__") or inspect.isbuiltin(obj):\n                continue\n            serializable, _ = _inspect_serializability(\n                obj,\n                name=name,\n                depth=depth - 1,\n                parent=parent,\n                failure_set=failure_set,\n                printer=printer,\n            )\n            found = found or not serializable\n            if found:\n                break\n    if not found:\n        printer.print(\n            f"WARNING: Did not find non-serializable object in {base_obj}. "\n            "This may be an oversight."\n        )\n    return found\n',
                          docstring:
                            'Adds the first-found non-serializable element to the failure_set.',
                        },
                      },
                      retval: {
                        kind: 'unbound',
                        annotation:
                          'typing.Tuple[bool, typing.Set[ray.util.check_serialize.FailureTuple]]',
                      },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                      firstlineno: 172,
                      source:
                        'def _inspect_serializability(\n    base_obj, name, depth, parent, failure_set, printer\n) -> Tuple[bool, Set[FailureTuple]]:\n    colorama.init()\n    top_level = False\n    declaration = ""\n    found = False\n    if failure_set is None:\n        top_level = True\n        failure_set = set()\n        declaration = f"Checking Serializability of {base_obj}"\n        printer.print("=" * min(len(declaration), 80))\n        printer.print(declaration)\n        printer.print("=" * min(len(declaration), 80))\n\n        if name is None:\n            name = str(base_obj)\n    else:\n        printer.print(f"Serializing \'{name}\' {base_obj}...")\n    try:\n        cp.dumps(base_obj)\n        return True, failure_set\n    except Exception as e:\n        printer.print(\n            f"{colorama.Fore.RED}!!! FAIL{colorama.Fore.RESET} " f"serialization: {e}"\n        )\n        found = True\n        try:\n            if depth == 0:\n                failure_set.add(FailureTuple(base_obj, name, parent))\n        # Some objects may not be hashable, so we skip adding this to the set.\n        except Exception:\n            pass\n\n    if depth <= 0:\n        return False, failure_set\n\n    # TODO: we only differentiate between \'function\' and \'object\'\n    # but we should do a better job of diving into something\n    # more specific like a Type, Object, etc.\n    if inspect.isfunction(base_obj):\n        _inspect_func_serialization(\n            base_obj,\n            depth=depth,\n            parent=base_obj,\n            failure_set=failure_set,\n            printer=printer,\n        )\n    else:\n        _inspect_generic_serialization(\n            base_obj,\n            depth=depth,\n            parent=base_obj,\n            failure_set=failure_set,\n            printer=printer,\n        )\n\n    if not failure_set:\n        failure_set.add(FailureTuple(base_obj, name, parent))\n\n    if top_level:\n        printer.print("=" * min(len(declaration), 80))\n        if not failure_set:\n            printer.print(\n                "Nothing failed the inspect_serialization test, though "\n                "serialization did not succeed."\n            )\n        else:\n            fail_vars = (\n                f"\\n\\n\\t{colorama.Style.BRIGHT}"\n                + "\\n".join(str(k) for k in failure_set)\n                + f"{colorama.Style.RESET_ALL}\\n\\n"\n            )\n            printer.print(\n                f"Variable: {fail_vars}was found to be non-serializable. "\n                "There may be multiple other undetected variables that were "\n                "non-serializable. "\n            )\n            printer.print(\n                "Consider either removing the "\n                "instantiation/imports of these variables or moving the "\n                "instantiation into the scope of the function/class. "\n            )\n        printer.print("=" * min(len(declaration), 80))\n        printer.print(\n            "Check https://docs.ray.io/en/master/ray-core/objects/serialization.html#troubleshooting for more information."  # noqa\n        )\n        printer.print(\n            "If you have any suggestions on how to improve "\n            "this error message, please reach out to the "\n            "Ray developers on github.com/ray-project/ray/issues/"\n        )\n        printer.print("=" * min(len(declaration), 80))\n    return not found, failure_set\n',
                    },
                  },
                  retval: {
                    kind: 'unbound',
                    annotation:
                      'typing.Tuple[bool, typing.Set[ray.util.check_serialize.FailureTuple]]',
                  },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/check_serialize.py',
                  firstlineno: 146,
                  source:
                    '@DeveloperAPI\ndef inspect_serializability(\n    base_obj: Any,\n    name: Optional[str] = None,\n    depth: int = 3,\n    print_file: Optional[Any] = None,\n) -> Tuple[bool, Set[FailureTuple]]:\n    """Identifies what objects are preventing serialization.\n\n    Args:\n        base_obj: Object to be serialized.\n        name: Optional name of string.\n        depth: Depth of the scope stack to walk through. Defaults to 3.\n        print_file: file argument that will be passed to print().\n\n    Returns:\n        bool: True if serializable.\n        set[FailureTuple]: Set of unserializable objects.\n\n    .. versionadded:: 1.1.0\n\n    """\n    printer = _Printer(print_file)\n    return _inspect_serializability(base_obj, name, depth, None, None, printer)\n',
                  docstring:
                    'Identifies what objects are preventing serialization.\n\nArgs:\n    base_obj: Object to be serialized.\n    name: Optional name of string.\n    depth: Depth of the scope stack to walk through. Defaults to 3.\n    print_file: file argument that will be passed to print().\n\nReturns:\n    bool: True if serializable.\n    set[FailureTuple]: Set of unserializable objects.\n\n.. versionadded:: 1.1.0\n\n**DeveloperAPI:** This API may change across minor Ray releases.',
                },
              },
              retval: { kind: 'unbound', annotation: 'typing.Any' },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/serialization.py',
              firstlineno: 58,
              source:
                'def pickle_dumps(obj: Any, error_msg: str):\n    """Wrap cloudpickle.dumps to provide better error message\n    when the object is not serializable.\n    """\n    try:\n        return pickle.dumps(obj)\n    except TypeError as e:\n        sio = io.StringIO()\n        inspect_serializability(obj, print_file=sio)\n        msg = f"{error_msg}:\\n{sio.getvalue()}"\n        raise TypeError(msg) from e\n',
              docstring:
                'Wrap cloudpickle.dumps to provide better error message\nwhen the object is not serializable.',
            },
            ray_option_utils: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x10aa843b0',
              hash: 'python/hash/0x10aa843b',
              snapshot:
                "<module 'ray._private.ray_option_utils' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/ray_option_utils.py'>",
            },
            os: {
              kind: 'object',
              type: 'builtins.module',
              id: 'python/id/0x100826590',
              hash: 'python/hash/0x10082659',
              snapshot:
                "<module 'os' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/os.py'>",
            },
            int: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x1026e5160',
              hash: 'python/hash/0x1026e516',
              snapshot: "<class 'int'>",
            },
            parse_runtime_env: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10aab65e0',
              hash: 'python/hash/0x10aab65e',
              module: 'ray._private.utils',
              name: 'parse_runtime_env',
              boundvars: {
                runtime_env: {
                  kind: 'unbound',
                  annotation:
                    "typing.Union[typing.Dict, ForwardRef('RuntimeEnv'), NoneType]",
                },
              },
              freevars: {
                isinstance: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778b80',
                  hash: 'python/hash/0x27a186',
                  snapshot: '<built-in function isinstance>',
                },
                dict: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e8dc0',
                  hash: 'python/hash/0x1026e8dc',
                  snapshot: "<class 'dict'>",
                },
                TypeError: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x102699ab0',
                  hash: 'python/hash/0x102699ab',
                  snapshot: "<class 'TypeError'>",
                },
                type: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e8698',
                  hash: 'python/hash/-0x7fffffffefd91797',
                  snapshot: "<class 'type'>",
                },
              },
              retval: { kind: 'unbound', annotation: 'typing.Any' },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/utils.py',
              firstlineno: 1599,
              source:
                'def parse_runtime_env(runtime_env: Optional[Union[Dict, "RuntimeEnv"]]):\n    from ray.runtime_env import RuntimeEnv\n\n    # Parse local pip/conda config files here. If we instead did it in\n    # .remote(), it would get run in the Ray Client server, which runs on\n    # a remote node where the files aren\'t available.\n    if runtime_env:\n        if isinstance(runtime_env, dict):\n            return RuntimeEnv(**(runtime_env or {}))\n        raise TypeError(\n            "runtime_env must be dict or RuntimeEnv, ",\n            f"but got: {type(runtime_env)}",\n        )\n    else:\n        # Keep the new_runtime_env as None.  In .remote(), we need to know\n        # if runtime_env is None to know whether or not to fall back to the\n        # runtime_env specified in the @ray.remote decorator.\n        return None\n',
            },
            isinstance: {
              kind: 'object',
              type: 'builtins.builtin_function_or_method',
              id: 'python/id/0x100778b80',
              hash: 'python/hash/0x27a186',
              snapshot: '<built-in function isinstance>',
            },
            list: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x1026e9100',
              hash: 'python/hash/0x1026e910',
              snapshot: "<class 'list'>",
            },
            tuple: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x1026e54a0',
              hash: 'python/hash/0x1026e54a',
              snapshot: "<class 'tuple'>",
            },
            PlacementGroupSchedulingStrategy: {
              kind: 'object',
              type: 'builtins.type',
              id: 'python/id/0x13e139440',
              hash: 'python/hash/0x13e13944',
              snapshot:
                "<class 'ray.util.scheduling_strategies.PlacementGroupSchedulingStrategy'>",
            },
            _warn_if_using_deprecated_placement_group: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10aabf4c0',
              hash: 'python/hash/0x10aabf4c',
              module: 'ray._private.ray_option_utils',
              name: '_warn_if_using_deprecated_placement_group',
              boundvars: {
                options: {
                  kind: 'unbound',
                  annotation: 'typing.Dict[str, typing.Any]',
                },
                caller_stacklevel: {
                  kind: 'unbound',
                  annotation: "<class 'int'>",
                },
              },
              freevars: {
                warnings: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x1008a52c0',
                  hash: 'python/hash/0x1008a52c',
                  snapshot:
                    "<module 'warnings' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/warnings.py'>",
                },
                get_ray_doc_version: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aab4b80',
                  hash: 'python/hash/0x10aab4b8',
                  module: 'ray._private.utils',
                  name: 'get_ray_doc_version',
                  boundvars: {},
                  freevars: {
                    re: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x10093fe00',
                      hash: 'python/hash/0x10093fe0',
                      snapshot:
                        "<module 're' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/re.py'>",
                    },
                    ray: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x105576ef0',
                      hash: 'python/hash/0x105576ef',
                      snapshot:
                        "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/utils.py',
                  firstlineno: 1081,
                  source:
                    'def get_ray_doc_version():\n    """Get the docs.ray.io version corresponding to the ray.__version__."""\n    # The ray.__version__ can be official Ray release (such as 1.12.0), or\n    # dev (3.0.0dev0) or release candidate (2.0.0rc0). For the later we map\n    # to the master doc version at docs.ray.io.\n    if re.match(r"^\\d+\\.\\d+\\.\\d+$", ray.__version__) is None:\n        return "master"\n    # For the former (official Ray release), we have corresponding doc version\n    # released as well.\n    return f"releases-{ray.__version__}"\n',
                  docstring:
                    'Get the docs.ray.io version corresponding to the ray.__version__.',
                },
                DeprecationWarning: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x10269f148',
                  hash: 'python/hash/-0x7fffffffefd960ec',
                  snapshot: "<class 'DeprecationWarning'>",
                },
              },
              retval: { kind: 'unbound', annotation: 'typing.Any' },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/ray_option_utils.py',
              firstlineno: 239,
              source:
                'def _warn_if_using_deprecated_placement_group(\n    options: Dict[str, Any], caller_stacklevel: int\n):\n    placement_group = options["placement_group"]\n    placement_group_bundle_index = options["placement_group_bundle_index"]\n    placement_group_capture_child_tasks = options["placement_group_capture_child_tasks"]\n    if placement_group != "default":\n        warnings.warn(\n            "placement_group parameter is deprecated. Use "\n            "scheduling_strategy=PlacementGroupSchedulingStrategy(...) "\n            "instead, see the usage at "\n            f"https://docs.ray.io/en/{get_ray_doc_version()}/ray-core/package-ref.html#ray-remote.",  # noqa: E501\n            DeprecationWarning,\n            stacklevel=caller_stacklevel + 1,\n        )\n    if placement_group_bundle_index != -1:\n        warnings.warn(\n            "placement_group_bundle_index parameter is deprecated. Use "\n            "scheduling_strategy=PlacementGroupSchedulingStrategy(...) "\n            "instead, see the usage at "\n            f"https://docs.ray.io/en/{get_ray_doc_version()}/ray-core/package-ref.html#ray-remote.",  # noqa: E501\n            DeprecationWarning,\n            stacklevel=caller_stacklevel + 1,\n        )\n    if placement_group_capture_child_tasks:\n        warnings.warn(\n            "placement_group_capture_child_tasks parameter is deprecated. Use "\n            "scheduling_strategy=PlacementGroupSchedulingStrategy(...) "\n            "instead, see the usage at "\n            f"https://docs.ray.io/en/{get_ray_doc_version()}/ray-core/package-ref.html#ray-remote.",  # noqa: E501\n            DeprecationWarning,\n            stacklevel=caller_stacklevel + 1,\n        )\n',
            },
            _configure_placement_group_based_on_context: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10aac1550',
              hash: 'python/hash/0x10aac155',
              module: 'ray.util.placement_group',
              name: '_configure_placement_group_based_on_context',
              boundvars: {
                placement_group_capture_child_tasks: {
                  kind: 'unbound',
                  annotation: "<class 'bool'>",
                },
                bundle_index: { kind: 'unbound', annotation: "<class 'int'>" },
                resources: { kind: 'unbound', annotation: 'typing.Dict' },
                placement_resources: {
                  kind: 'unbound',
                  annotation: 'typing.Dict',
                },
                task_or_actor_repr: {
                  kind: 'unbound',
                  annotation: "<class 'str'>",
                },
                placement_group: {
                  kind: 'object',
                  type: 'builtins.str',
                  id: 'python/id/0x10077bc70',
                  hash: 'python/hash/0x16cd15e8cf278abb',
                  snapshot: "'default'",
                },
              },
              freevars: {
                AssertionError: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x10269df60',
                  hash: 'python/hash/0x10269df6',
                  snapshot: "<class 'AssertionError'>",
                },
                PlacementGroup: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x13e13a8a0',
                  hash: 'python/hash/0x13e13a8a',
                  snapshot: "<class 'ray.util.placement_group.PlacementGroup'>",
                },
                get_current_placement_group: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aac1310',
                  hash: 'python/hash/0x10aac131',
                  module: 'ray.util.placement_group',
                  name: 'get_current_placement_group',
                  boundvars: {},
                  freevars: {
                    auto_init_ray: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10a9629d0',
                      hash: 'python/hash/0x10a9629d',
                      module: 'ray._private.auto_init_hook',
                      name: 'auto_init_ray',
                      boundvars: {},
                      freevars: {
                        os: {
                          kind: 'object',
                          type: 'builtins.module',
                          id: 'python/id/0x100826590',
                          hash: 'python/hash/0x10082659',
                          snapshot:
                            "<module 'os' from '~/.rye/py/cpython@3.8.17/install/lib/python3.8/os.py'>",
                        },
                        ray: {
                          kind: 'object',
                          type: 'builtins.module',
                          id: 'python/id/0x105576ef0',
                          hash: 'python/hash/0x105576ef',
                          snapshot:
                            "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                        },
                        auto_init_lock: {
                          kind: 'object',
                          type: '_thread.lock',
                          id: 'python/id/0x10a9619f0',
                          hash: 'python/hash/0x10a9619f',
                          snapshot: '<unlocked _thread.lock object at 0x10a9619f0>',
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'typing.Any' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/auto_init_hook.py',
                      firstlineno: 9,
                      source:
                        'def auto_init_ray():\n    if (\n        os.environ.get("RAY_ENABLE_AUTO_CONNECT", "") != "0"\n        and not ray.is_initialized()\n    ):\n        auto_init_lock.acquire()\n        if not ray.is_initialized():\n            ray.init()\n        auto_init_lock.release()\n',
                    },
                    client_mode_should_convert: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10a9650d0',
                      hash: 'python/hash/0x10a9650d',
                      module: 'ray._private.client_mode_hook',
                      name: 'client_mode_should_convert',
                      boundvars: {},
                      freevars: {
                        is_client_mode_enabled: {
                          kind: 'object',
                          type: 'builtins.bool',
                          id: 'python/id/0x1026e8cd8',
                          hash: 'python/hash/0x0',
                          snapshot: 'False',
                        },
                        is_client_mode_enabled_by_default: {
                          kind: 'object',
                          type: 'builtins.bool',
                          id: 'python/id/0x1026e8cd8',
                          hash: 'python/hash/0x0',
                          snapshot: 'False',
                        },
                        _get_client_hook_status_on_thread: {
                          kind: 'function',
                          type: 'builtins.function',
                          id: 'python/id/0x10a962940',
                          hash: 'python/hash/0x10a96294',
                          module: 'ray._private.client_mode_hook',
                          name: '_get_client_hook_status_on_thread',
                          boundvars: {},
                          freevars: {
                            hasattr: {
                              kind: 'object',
                              type: 'builtins.builtin_function_or_method',
                              id: 'python/id/0x1007789f0',
                              hash: 'python/hash/0x27a154',
                              snapshot: '<built-in function hasattr>',
                            },
                            _client_hook_status_on_thread: {
                              kind: 'object',
                              type: '_thread._local',
                              id: 'python/id/0x10a9608b0',
                              hash: 'python/hash/0x10a9608b',
                              snapshot: '<_thread._local object at 0x10a9608b0>',
                            },
                          },
                          retval: { kind: 'unbound', annotation: 'typing.Any' },
                          filename:
                            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                          firstlineno: 27,
                          source:
                            'def _get_client_hook_status_on_thread():\n    """Get\'s the value of `_client_hook_status_on_thread`.\n    Since `_client_hook_status_on_thread` is a thread-local variable, we may\n    need to add and set the \'status\' attribute.\n    """\n    global _client_hook_status_on_thread\n    if not hasattr(_client_hook_status_on_thread, "status"):\n        _client_hook_status_on_thread.status = True\n    return _client_hook_status_on_thread.status\n',
                          docstring:
                            "Get's the value of `_client_hook_status_on_thread`.\nSince `_client_hook_status_on_thread` is a thread-local variable, we may\nneed to add and set the 'status' attribute.",
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'typing.Any' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
                      firstlineno: 108,
                      source:
                        'def client_mode_should_convert():\n    """Determines if functions should be converted to client mode."""\n\n    # `is_client_mode_enabled_by_default` is used for testing with\n    # `RAY_CLIENT_MODE=1`. This flag means all tests run with client mode.\n    return (\n        is_client_mode_enabled or is_client_mode_enabled_by_default\n    ) and _get_client_hook_status_on_thread()\n',
                      docstring:
                        'Determines if functions should be converted to client mode.',
                    },
                    ray: {
                      kind: 'object',
                      type: 'builtins.module',
                      id: 'python/id/0x105576ef0',
                      hash: 'python/hash/0x105576ef',
                      snapshot:
                        "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
                    },
                    PlacementGroup: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x13e13a8a0',
                      hash: 'python/hash/0x13e13a8a',
                      snapshot: "<class 'ray.util.placement_group.PlacementGroup'>",
                    },
                  },
                  retval: {
                    kind: 'unbound',
                    annotation:
                      'typing.Union[ray.util.placement_group.PlacementGroup, NoneType]',
                  },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                  firstlineno: 296,
                  source:
                    '@PublicAPI\ndef get_current_placement_group() -> Optional[PlacementGroup]:\n    """Get the current placement group which a task or actor is using.\n\n    It returns None if there\'s no current placement group for the worker.\n    For example, if you call this method in your driver, it returns None\n    (because drivers never belong to any placement group).\n\n    Examples:\n        .. testcode::\n\n            import ray\n            from ray.util.placement_group import get_current_placement_group\n            from ray.util.scheduling_strategies import PlacementGroupSchedulingStrategy\n\n            @ray.remote\n            def f():\n                # This returns the placement group the task f belongs to.\n                # It means this pg is identical to the pg created below.\n                return get_current_placement_group()\n\n            pg = ray.util.placement_group([{"CPU": 2}])\n            assert ray.get(f.options(\n                    scheduling_strategy=PlacementGroupSchedulingStrategy(\n                        placement_group=pg)).remote()) == pg\n\n            # Driver doesn\'t belong to any placement group,\n            # so it returns None.\n            assert get_current_placement_group() is None\n\n    Return:\n        PlacementGroup: Placement group object.\n            None if the current task or actor wasn\'t\n            created with any placement group.\n    """\n    auto_init_ray()\n    if client_mode_should_convert():\n        # Client mode is only a driver.\n        return None\n    worker = ray._private.worker.global_worker\n    worker.check_connected()\n    pg_id = worker.placement_group_id\n    if pg_id.is_nil():\n        return None\n    return PlacementGroup(pg_id)\n',
                  docstring:
                    "Get the current placement group which a task or actor is using.\n\nIt returns None if there's no current placement group for the worker.\nFor example, if you call this method in your driver, it returns None\n(because drivers never belong to any placement group).\n\nExamples:\n    .. testcode::\n\n        import ray\n        from ray.util.placement_group import get_current_placement_group\n        from ray.util.scheduling_strategies import PlacementGroupSchedulingStrategy\n\n        @ray.remote\n        def f():\n            # This returns the placement group the task f belongs to.\n            # It means this pg is identical to the pg created below.\n            return get_current_placement_group()\n\n        pg = ray.util.placement_group([{\"CPU\": 2}])\n        assert ray.get(f.options(\n                scheduling_strategy=PlacementGroupSchedulingStrategy(\n                    placement_group=pg)).remote()) == pg\n\n        # Driver doesn't belong to any placement group,\n        # so it returns None.\n        assert get_current_placement_group() is None\n\nReturn:\n    PlacementGroup: Placement group object.\n        None if the current task or actor wasn't\n        created with any placement group.\n\nPublicAPI: This API is stable across Ray releases.",
                },
                isinstance: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778b80',
                  hash: 'python/hash/0x27a186',
                  snapshot: '<built-in function isinstance>',
                },
                check_placement_group_index: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aac13a0',
                  hash: 'python/hash/0x10aac13a',
                  module: 'ray.util.placement_group',
                  name: 'check_placement_group_index',
                  boundvars: {
                    placement_group: {
                      kind: 'unbound',
                      annotation: "<class 'ray.util.placement_group.PlacementGroup'>",
                    },
                    bundle_index: {
                      kind: 'unbound',
                      annotation: "<class 'int'>",
                    },
                  },
                  freevars: {
                    AssertionError: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x10269df60',
                      hash: 'python/hash/0x10269df6',
                      snapshot: "<class 'AssertionError'>",
                    },
                    ValueError: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x10269d740',
                      hash: 'python/hash/0x10269d74',
                      snapshot: "<class 'ValueError'>",
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'None' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                  firstlineno: 343,
                  source:
                    'def check_placement_group_index(\n    placement_group: PlacementGroup, bundle_index: int\n) -> None:\n    assert placement_group is not None\n    if placement_group.id.is_nil():\n        if bundle_index != -1:\n            raise ValueError(\n                "If placement group is not set, "\n                "the value of bundle index must be -1."\n            )\n    elif bundle_index >= placement_group.bundle_count or bundle_index < -1:\n        raise ValueError(\n            f"placement group bundle index {bundle_index} "\n            f"is invalid. Valid placement group indexes: "\n            f"0-{placement_group.bundle_count}"\n        )\n',
                },
                _validate_resource_shape: {
                  kind: 'function',
                  type: 'builtins.function',
                  id: 'python/id/0x10aac14c0',
                  hash: 'python/hash/0x10aac14c',
                  module: 'ray.util.placement_group',
                  name: '_validate_resource_shape',
                  boundvars: {
                    placement_group: {
                      kind: 'unbound',
                      annotation: 'typing.Any',
                    },
                    resources: { kind: 'unbound', annotation: 'typing.Any' },
                    placement_resources: {
                      kind: 'unbound',
                      annotation: 'typing.Any',
                    },
                    task_or_actor_repr: {
                      kind: 'unbound',
                      annotation: 'typing.Any',
                    },
                  },
                  freevars: {
                    _valid_resource_shape: {
                      kind: 'function',
                      type: 'builtins.function',
                      id: 'python/id/0x10aac1430',
                      hash: 'python/hash/0x10aac143',
                      module: 'ray.util.placement_group',
                      name: '_valid_resource_shape',
                      boundvars: {
                        resources: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                        bundle_specs: {
                          kind: 'unbound',
                          annotation: 'typing.Any',
                        },
                      },
                      freevars: {
                        BUNDLE_RESOURCE_LABEL: {
                          kind: 'object',
                          type: 'builtins.str',
                          id: 'python/id/0x1041b8ef0',
                          hash: 'python/hash/0xea1fe391db5f16a',
                          snapshot: "'bundle'",
                        },
                      },
                      retval: { kind: 'unbound', annotation: 'typing.Any' },
                      filename:
                        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                      firstlineno: 361,
                      source:
                        'def _valid_resource_shape(resources, bundle_specs):\n    """\n    If the resource shape cannot fit into every\n    bundle spec, return False\n    """\n    for bundle in bundle_specs:\n        fit_in_bundle = True\n        for resource, requested_val in resources.items():\n            # Skip "bundle" resource as it is automatically added\n            # to all nodes with bundles by the placement group.\n            if resource == BUNDLE_RESOURCE_LABEL:\n                continue\n            if bundle.get(resource, 0) < requested_val:\n                fit_in_bundle = False\n                break\n        if fit_in_bundle:\n            # If resource request fits in any bundle, it is valid.\n            return True\n    return False\n',
                      docstring:
                        'If the resource shape cannot fit into every\nbundle spec, return False',
                    },
                    ValueError: {
                      kind: 'object',
                      type: 'builtins.type',
                      id: 'python/id/0x10269d740',
                      hash: 'python/hash/0x10269d74',
                      snapshot: "<class 'ValueError'>",
                    },
                  },
                  retval: { kind: 'unbound', annotation: 'typing.Any' },
                  filename:
                    '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
                  firstlineno: 382,
                  source:
                    'def _validate_resource_shape(\n    placement_group, resources, placement_resources, task_or_actor_repr\n):\n    bundles = placement_group.bundle_specs\n    resources_valid = _valid_resource_shape(resources, bundles)\n    placement_resources_valid = _valid_resource_shape(placement_resources, bundles)\n\n    if not resources_valid:\n        raise ValueError(\n            f"Cannot schedule {task_or_actor_repr} with "\n            "the placement group because the resource request "\n            f"{resources} cannot fit into any bundles for "\n            f"the placement group, {bundles}."\n        )\n    if not placement_resources_valid:\n        # Happens for the default actor case.\n        # placement_resources is not an exposed concept to users,\n        # so we should write more specialized error messages.\n        raise ValueError(\n            f"Cannot schedule {task_or_actor_repr} with "\n            "the placement group because the actor requires "\n            f"{placement_resources.get(\'CPU\', 0)} CPU for "\n            "creation, but it cannot "\n            f"fit into any bundles for the placement group, "\n            f"{bundles}. Consider "\n            "creating a placement group with CPU resources."\n        )\n',
                },
              },
              retval: {
                kind: 'unbound',
                annotation: "<class 'ray.util.placement_group.PlacementGroup'>",
              },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/placement_group.py',
              firstlineno: 411,
              source:
                'def _configure_placement_group_based_on_context(\n    placement_group_capture_child_tasks: bool,\n    bundle_index: int,\n    resources: Dict,\n    placement_resources: Dict,\n    task_or_actor_repr: str,\n    placement_group: Union[PlacementGroup, str, None] = "default",\n) -> PlacementGroup:\n    """Configure the placement group based on the given context.\n\n    Based on the given context, this API returns the placement group instance\n    for task/actor scheduling.\n\n    Params:\n        placement_group_capture_child_tasks: Whether or not the\n            placement group needs to be captured from the global\n            context.\n        bundle_index: The bundle index for tasks/actor scheduling.\n        resources: The scheduling resources.\n        placement_resources: The scheduling placement resources for\n            actors.\n        task_or_actor_repr: The repr of task or actor\n            function/class descriptor.\n        placement_group: The placement group instance.\n            - "default": Default placement group argument. Currently,\n                the default behavior is to capture the parent task\'\n                placement group if placement_group_capture_child_tasks\n                is set.\n            - None: means placement group is explicitly not configured.\n            - Placement group instance: In this case, do nothing.\n\n    Returns:\n        Placement group instance based on the given context.\n\n    Raises:\n        ValueError: If the bundle index is invalid for the placement group\n            or the requested resources shape doesn\'t fit to any\n            bundles.\n    """\n    # Validate inputs.\n    assert placement_group_capture_child_tasks is not None\n    assert resources is not None\n\n    # Validate and get the PlacementGroup instance.\n    # Placement group could be None, default, or placement group.\n    # Default behavior is "do not capture child tasks".\n    if placement_group != "default":\n        if not placement_group:\n            placement_group = PlacementGroup.empty()\n    elif placement_group == "default":\n        if placement_group_capture_child_tasks:\n            placement_group = get_current_placement_group()\n        else:\n            placement_group = PlacementGroup.empty()\n\n    if not placement_group:\n        placement_group = PlacementGroup.empty()\n    assert isinstance(placement_group, PlacementGroup)\n\n    # Validate the index.\n    check_placement_group_index(placement_group, bundle_index)\n\n    # Validate the shape.\n    if not placement_group.is_empty:\n        _validate_resource_shape(\n            placement_group, resources, placement_resources, task_or_actor_repr\n        )\n    return placement_group\n',
              docstring:
                'Configure the placement group based on the given context.\n\nBased on the given context, this API returns the placement group instance\nfor task/actor scheduling.\n\nParams:\n    placement_group_capture_child_tasks: Whether or not the\n        placement group needs to be captured from the global\n        context.\n    bundle_index: The bundle index for tasks/actor scheduling.\n    resources: The scheduling resources.\n    placement_resources: The scheduling placement resources for\n        actors.\n    task_or_actor_repr: The repr of task or actor\n        function/class descriptor.\n    placement_group: The placement group instance.\n        - "default": Default placement group argument. Currently,\n            the default behavior is to capture the parent task\'\n            placement group if placement_group_capture_child_tasks\n            is set.\n        - None: means placement group is explicitly not configured.\n        - Placement group instance: In this case, do nothing.\n\nReturns:\n    Placement group instance based on the given context.\n\nRaises:\n    ValueError: If the bundle index is invalid for the placement group\n        or the requested resources shape doesn\'t fit to any\n        bundles.',
            },
            get_runtime_env_info: {
              kind: 'function',
              type: 'builtins.function',
              id: 'python/id/0x10aab6550',
              hash: 'python/hash/0x10aab655',
              module: 'ray._private.utils',
              name: 'get_runtime_env_info',
              boundvars: {
                runtime_env: { kind: 'unbound', annotation: 'RuntimeEnv' },
                is_job_runtime_env: {
                  kind: 'object',
                  type: 'builtins.bool',
                  id: 'python/id/0x1026e8cd8',
                  hash: 'python/hash/0x0',
                  snapshot: 'False',
                },
                serialize: {
                  kind: 'object',
                  type: 'builtins.bool',
                  id: 'python/id/0x1026e8cd8',
                  hash: 'python/hash/0x0',
                  snapshot: 'False',
                },
              },
              freevars: {
                ProtoRuntimeEnvInfo: {
                  kind: 'object',
                  type: 'google.protobuf.internal.python_message.GeneratedProtocolMessageType',
                  id: 'python/id/0x10329b610',
                  hash: 'python/hash/0x10329b61',
                  snapshot:
                    "<class 'src.ray.protobuf.runtime_env_common_pb2.RuntimeEnvInfo'>",
                },
                len: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778c70',
                  hash: 'python/hash/0x400000000027a1e0',
                  snapshot: '<built-in function len>',
                },
                isinstance: {
                  kind: 'object',
                  type: 'builtins.builtin_function_or_method',
                  id: 'python/id/0x100778b80',
                  hash: 'python/hash/0x27a186',
                  snapshot: '<built-in function isinstance>',
                },
                bool: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026d9340',
                  hash: 'python/hash/0x1026d934',
                  snapshot: "<class 'bool'>",
                },
                TypeError: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x102699ab0',
                  hash: 'python/hash/0x102699ab',
                  snapshot: "<class 'TypeError'>",
                },
                type: {
                  kind: 'object',
                  type: 'builtins.type',
                  id: 'python/id/0x1026e8698',
                  hash: 'python/hash/-0x7fffffffefd91797',
                  snapshot: "<class 'type'>",
                },
                json_format: {
                  kind: 'object',
                  type: 'builtins.module',
                  id: 'python/id/0x10aaa0450',
                  hash: 'python/hash/0x10aaa045',
                  snapshot:
                    "<module 'google.protobuf.json_format' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/google/protobuf/json_format.py'>",
                },
              },
              retval: { kind: 'unbound', annotation: 'typing.Any' },
              filename:
                '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/utils.py',
              firstlineno: 1537,
              source:
                'def get_runtime_env_info(\n    runtime_env: "RuntimeEnv",\n    *,\n    is_job_runtime_env: bool = False,\n    serialize: bool = False,\n):\n    """Create runtime env info from runtime env.\n\n    In the user interface, the argument `runtime_env` contains some fields\n    which not contained in `ProtoRuntimeEnv` but in `ProtoRuntimeEnvInfo`,\n    such as `eager_install`. This function will extract those fields from\n    `RuntimeEnv` and create a new `ProtoRuntimeEnvInfo`, and serialize it.\n    """\n    from ray.runtime_env import RuntimeEnvConfig\n\n    proto_runtime_env_info = ProtoRuntimeEnvInfo()\n\n    if runtime_env.working_dir_uri():\n        proto_runtime_env_info.uris.working_dir_uri = runtime_env.working_dir_uri()\n    if len(runtime_env.py_modules_uris()) > 0:\n        proto_runtime_env_info.uris.py_modules_uris[:] = runtime_env.py_modules_uris()\n\n    # TODO(Catch-Bull): overload `__setitem__` for `RuntimeEnv`, change the\n    # runtime_env of all internal code from dict to RuntimeEnv.\n\n    runtime_env_config = runtime_env.get("config")\n    if runtime_env_config is None:\n        runtime_env_config = RuntimeEnvConfig.default_config()\n    else:\n        runtime_env_config = RuntimeEnvConfig.parse_and_validate_runtime_env_config(\n            runtime_env_config\n        )\n\n    proto_runtime_env_info.runtime_env_config.CopyFrom(\n        runtime_env_config.build_proto_runtime_env_config()\n    )\n\n    # Normally, `RuntimeEnv` should guarantee the accuracy of field eager_install,\n    # but so far, the internal code has not completely prohibited direct\n    # modification of fields in RuntimeEnv, so we should check it for insurance.\n    eager_install = (\n        runtime_env_config.get("eager_install")\n        if runtime_env_config is not None\n        else None\n    )\n    if is_job_runtime_env or eager_install is not None:\n        if eager_install is None:\n            eager_install = True\n        elif not isinstance(eager_install, bool):\n            raise TypeError(\n                f"eager_install must be a boolean. got {type(eager_install)}"\n            )\n        proto_runtime_env_info.runtime_env_config.eager_install = eager_install\n\n    proto_runtime_env_info.serialized_runtime_env = runtime_env.serialize()\n\n    if not serialize:\n        return proto_runtime_env_info\n\n    return json_format.MessageToJson(proto_runtime_env_info)\n',
              docstring:
                'Create runtime env info from runtime env.\n\nIn the user interface, the argument `runtime_env` contains some fields\nwhich not contained in `ProtoRuntimeEnv` but in `ProtoRuntimeEnvInfo`,\nsuch as `eager_install`. This function will extract those fields from\n`RuntimeEnv` and create a new `ProtoRuntimeEnvInfo`, and serialize it.',
            },
            _task_launch_hook: {
              kind: 'object',
              type: 'builtins.NoneType',
              id: 'python/id/0x1026e94f0',
              hash: 'python/hash/0x1026e94f',
              snapshot: 'None',
            },
          },
          retval: {
            kind: 'object',
            type: 'ray._raylet.ObjectRef',
            id: 'ray/ObjectRef(c2668a65bda616c1ffffffffffffffffffffffff0100000001000000)',
            hash: 'python/hash/0x2728c43991d74cbd',
            snapshot:
              'ObjectRef(c2668a65bda616c1ffffffffffffffffffffffff0100000001000000)',
          },
          filename:
            '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
          firstlineno: 244,
          source:
            '@_tracing_task_invocation\ndef _remote(self, args=None, kwargs=None, **task_options):\n    """Submit the remote function for execution."""\n    # We pop the "max_calls" coming from "@ray.remote" here. We no longer need\n    # it in "_remote()".\n    task_options.pop("max_calls", None)\n    auto_init_ray()\n    if client_mode_should_convert():\n        return client_mode_convert_function(self, args, kwargs, **task_options)\n\n    worker = ray._private.worker.global_worker\n    worker.check_connected()\n\n    # If this function was not exported in this session and job, we need to\n    # export this function again, because the current GCS doesn\'t have it.\n    if (\n        not self._is_cross_language\n        and self._last_export_session_and_job != worker.current_session_and_job\n    ):\n        self._function_descriptor = PythonFunctionDescriptor.from_function(\n            self._function, self._uuid\n        )\n        # There is an interesting question here. If the remote function is\n        # used by a subsequent driver (in the same script), should the\n        # second driver pickle the function again? If yes, then the remote\n        # function definition can differ in the second driver (e.g., if\n        # variables in its closure have changed). We probably want the\n        # behavior of the remote function in the second driver to be\n        # independent of whether or not the function was invoked by the\n        # first driver. This is an argument for repickling the function,\n        # which we do here.\n        self._pickled_function = pickle_dumps(\n            self._function,\n            f"Could not serialize the function {self._function_descriptor.repr}",\n        )\n\n        self._last_export_session_and_job = worker.current_session_and_job\n        worker.function_actor_manager.export(self)\n\n    kwargs = {} if kwargs is None else kwargs\n    args = [] if args is None else args\n\n    # fill task required options\n    for k, v in ray_option_utils.task_options.items():\n        if k == "max_retries":\n            # TODO(swang): We need to override max_retries here because the default\n            # value gets set at Ray import time. Ideally, we should allow setting\n            # default values from env vars for other options too.\n            v.default_value = os.environ.get(\n                "RAY_TASK_MAX_RETRIES", v.default_value\n            )\n            v.default_value = int(v.default_value)\n        task_options[k] = task_options.get(k, v.default_value)\n    # "max_calls" already takes effects and should not apply again.\n    # Remove the default value here.\n    task_options.pop("max_calls", None)\n\n    # TODO(suquark): cleanup these fields\n    name = task_options["name"]\n    runtime_env = parse_runtime_env(task_options["runtime_env"])\n    placement_group = task_options["placement_group"]\n    placement_group_bundle_index = task_options["placement_group_bundle_index"]\n    placement_group_capture_child_tasks = task_options[\n        "placement_group_capture_child_tasks"\n    ]\n    scheduling_strategy = task_options["scheduling_strategy"]\n    num_returns = task_options["num_returns"]\n    if num_returns == "dynamic":\n        num_returns = -1\n    elif num_returns == "streaming":\n        # TODO(sang): This is a temporary private API.\n        # Remove it when we migrate to the streaming generator.\n        num_returns = ray._raylet.STREAMING_GENERATOR_RETURN\n\n    max_retries = task_options["max_retries"]\n    retry_exceptions = task_options["retry_exceptions"]\n    if isinstance(retry_exceptions, (list, tuple)):\n        retry_exception_allowlist = tuple(retry_exceptions)\n        retry_exceptions = True\n    else:\n        retry_exception_allowlist = None\n\n    if scheduling_strategy is None or not isinstance(\n        scheduling_strategy, PlacementGroupSchedulingStrategy\n    ):\n        _warn_if_using_deprecated_placement_group(task_options, 4)\n\n    resources = ray._private.utils.resources_from_ray_options(task_options)\n\n    if scheduling_strategy is None or isinstance(\n        scheduling_strategy, PlacementGroupSchedulingStrategy\n    ):\n        if isinstance(scheduling_strategy, PlacementGroupSchedulingStrategy):\n            placement_group = scheduling_strategy.placement_group\n            placement_group_bundle_index = (\n                scheduling_strategy.placement_group_bundle_index\n            )\n            placement_group_capture_child_tasks = (\n                scheduling_strategy.placement_group_capture_child_tasks\n            )\n\n        if placement_group_capture_child_tasks is None:\n            placement_group_capture_child_tasks = (\n                worker.should_capture_child_tasks_in_placement_group\n            )\n        placement_group = _configure_placement_group_based_on_context(\n            placement_group_capture_child_tasks,\n            placement_group_bundle_index,\n            resources,\n            {},  # no placement_resources for tasks\n            self._function_descriptor.function_name,\n            placement_group=placement_group,\n        )\n        if not placement_group.is_empty:\n            scheduling_strategy = PlacementGroupSchedulingStrategy(\n                placement_group,\n                placement_group_bundle_index,\n                placement_group_capture_child_tasks,\n            )\n        else:\n            scheduling_strategy = "DEFAULT"\n\n    serialized_runtime_env_info = None\n    if runtime_env is not None:\n        serialized_runtime_env_info = get_runtime_env_info(\n            runtime_env,\n            is_job_runtime_env=False,\n            serialize=True,\n        )\n\n    if _task_launch_hook:\n        _task_launch_hook(self._function_descriptor, resources, scheduling_strategy)\n\n    def invocation(args, kwargs):\n        if self._is_cross_language:\n            list_args = cross_language._format_args(worker, args, kwargs)\n        elif not args and not kwargs and not self._function_signature:\n            list_args = []\n        else:\n            list_args = ray._private.signature.flatten_args(\n                self._function_signature, args, kwargs\n            )\n\n        if worker.mode == ray._private.worker.LOCAL_MODE:\n            assert (\n                not self._is_cross_language\n            ), "Cross language remote function cannot be executed locally."\n        object_refs = worker.core_worker.submit_task(\n            self._language,\n            self._function_descriptor,\n            list_args,\n            name if name is not None else "",\n            num_returns,\n            resources,\n            max_retries,\n            retry_exceptions,\n            retry_exception_allowlist,\n            scheduling_strategy,\n            worker.debugger_breakpoint,\n            serialized_runtime_env_info or "{}",\n        )\n        # Reset worker\'s debug context from the last "remote" command\n        # (which applies only to this .remote call).\n        worker.debugger_breakpoint = b""\n        if num_returns == STREAMING_GENERATOR_RETURN:\n            # Streaming generator will return a single ref\n            # that is for the generator task.\n            assert len(object_refs) == 1\n            generator_ref = object_refs[0]\n            return StreamingObjectRefGenerator(generator_ref, worker)\n        if len(object_refs) == 1:\n            return object_refs[0]\n        elif len(object_refs) > 1:\n            return object_refs\n\n    if self._decorator is not None:\n        invocation = self._decorator(invocation)\n\n    return invocation(args, kwargs)\n',
          docstring: 'Submit the remote function for execution.',
        },
        stackframes: [
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
            lineno: 244,
            func: '_remote',
            code: '    @_tracing_task_invocation\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/util/tracing/tracing_helper.py',
            lineno: 306,
            func: '_invocation_remote_span',
            code: '            return method(self, args, kwargs, *_args, **_kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
            lineno: 108,
            func: '_remote',
            code: '        return super()._remote(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/remote_function.py',
            lineno: 230,
            func: 'remote',
            code: '                return func_cls._remote(args=args, kwargs=kwargs, **updated_options)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/pyu.py',
            lineno: 98,
            func: 'wrapper',
            code: '                sfd.remote(self._run)\n',
          },
          {
            filename: 'presets/millionaires/_algorithm.py',
            lineno: 25,
            func: '<module>',
            code: 'balance_alice = devices(PYU, "alice")(balance)(key, 3)\n',
          },
          {
            filename: 'Cell In[3]',
            lineno: 35,
            func: '<module>',
            code: '        exec(_algorithm, globals())\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3508,
            func: 'run_code',
            code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3448,
            func: 'run_ast_nodes',
            code: '                if await self.run_code(code, result, async_=asy):\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3269,
            func: 'run_cell_async',
            code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
            lineno: 129,
            func: '_pseudo_sync_runner',
            code: '        coro.send(None)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3064,
            func: '_run_cell',
            code: '            result = runner(coro)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
            lineno: 3009,
            func: 'run_cell',
            code: '            result = self._run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
            lineno: 546,
            func: 'run_cell',
            code: '        return super().run_cell(*args, **kwargs)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
            lineno: 422,
            func: 'do_execute',
            code: '                    res = shell.run_cell(\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 740,
            func: 'execute_request',
            code: '            reply_content = await reply_content\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 412,
            func: 'dispatch_shell',
            code: '                    await result\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 505,
            func: 'process_one',
            code: '        await dispatch(*args)\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
            lineno: 516,
            func: 'dispatch_queue',
            code: '                await self.process_one()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
            lineno: 81,
            func: '_run',
            code: '            self._context.run(self._callback, *self._args)\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 1859,
            func: '_run_once',
            code: '                handle._run()\n',
          },
          {
            filename:
              '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
            lineno: 570,
            func: 'run_forever',
            code: '                self._run_once()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
            lineno: 195,
            func: 'start',
            code: '        self.asyncio_loop.run_forever()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
            lineno: 736,
            func: 'start',
            code: '                self.io_loop.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
            lineno: 1051,
            func: 'launch_instance',
            code: '        app.start()\n',
          },
          {
            filename:
              '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
            lineno: 17,
            func: '<module>',
            code: '    app.launch_new_instance()\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 87,
            func: '_run_code',
            code: '    exec(code, run_globals)\n',
          },
          {
            filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
            lineno: 194,
            func: '_run_module_as_main',
            code: '    return _run_code(code, main_globals, None,\n',
          },
        ],
      },
      inner_calls: [],
    },
  ],
};

export const MOCK_TRACE_WITHOUT_SEMANTICS: InterpretedCall = {
  span_id: '0xe5ed25595a21022f',
  start_time: '2023-10-25T09:37:47.625843',
  end_time: '2023-10-25T09:37:47.632412',
  call: {
    checkpoint: { api_level: 10 },
    snapshot: {
      kind: 'function',
      type: 'builtins.function',
      id: 'python/id/0x10b314700',
      hash: 'python/hash/0x10b31470',
      module: 'ray._private.worker',
      name: 'get',
      boundvars: {
        object_refs: {
          kind: 'sequence',
          type: 'builtins.list',
          id: 'python/id/0x29f4025c0',
          snapshot: '[]',
          values: [],
        },
        timeout: {
          kind: 'object',
          type: 'builtins.NoneType',
          id: 'python/id/0x1026e94f0',
          hash: 'python/hash/0x1026e94f',
          snapshot: 'None',
        },
      },
      freevars: {
        global_worker: {
          kind: 'object',
          type: 'ray._private.worker.Worker',
          id: 'python/id/0x10b2ffe20',
          hash: 'python/hash/0x10b2ffe2',
          snapshot: '<ray._private.worker.Worker object at 0x10b2ffe20>',
        },
        hasattr: {
          kind: 'object',
          type: 'builtins.builtin_function_or_method',
          id: 'python/id/0x1007789f0',
          hash: 'python/hash/0x27a154',
          snapshot: '<built-in function hasattr>',
        },
        blocking_get_inside_async_warned: {
          kind: 'object',
          type: 'builtins.bool',
          id: 'python/id/0x1026e8cd8',
          hash: 'python/hash/0x0',
          snapshot: 'False',
        },
        logger: {
          kind: 'object',
          type: 'logging.Logger',
          id: 'python/id/0x10ac641f0',
          hash: 'python/hash/0x10ac641f',
          snapshot: '<Logger ray._private.worker (INFO)>',
        },
        profiling: {
          kind: 'object',
          type: 'builtins.module',
          id: 'python/id/0x10aaecc70',
          hash: 'python/hash/0x10aaecc7',
          snapshot:
            "<module 'ray._private.profiling' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/profiling.py'>",
        },
        isinstance: {
          kind: 'object',
          type: 'builtins.builtin_function_or_method',
          id: 'python/id/0x100778b80',
          hash: 'python/hash/0x27a186',
          snapshot: '<built-in function isinstance>',
        },
        StreamingObjectRefGenerator: {
          kind: 'object',
          type: 'builtins.type',
          id: 'python/id/0x13e02ec10',
          hash: 'python/hash/0x13e02ec1',
          snapshot: "<class 'ray._raylet.StreamingObjectRefGenerator'>",
        },
        ray: {
          kind: 'object',
          type: 'builtins.module',
          id: 'python/id/0x105576ef0',
          hash: 'python/hash/0x105576ef',
          snapshot:
            "<module 'ray' from '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/__init__.py'>",
        },
        list: {
          kind: 'object',
          type: 'builtins.type',
          id: 'python/id/0x1026e9100',
          hash: 'python/hash/0x1026e910',
          snapshot: "<class 'list'>",
        },
        ValueError: {
          kind: 'object',
          type: 'builtins.type',
          id: 'python/id/0x10269d740',
          hash: 'python/hash/0x10269d74',
          snapshot: "<class 'ValueError'>",
        },
        enumerate: {
          kind: 'object',
          type: 'builtins.type',
          id: 'python/id/0x1026adff8',
          hash: 'python/hash/-0x7fffffffefd95201',
          snapshot: "<class 'enumerate'>",
        },
        RayError: {
          kind: 'object',
          type: 'builtins.type',
          id: 'python/id/0x13e13fd00',
          hash: 'python/hash/0x13e13fd0',
          snapshot: "<class 'ray.exceptions.RayError'>",
        },
        RayTaskError: {
          kind: 'object',
          type: 'builtins.type',
          id: 'python/id/0x13d625ff0',
          hash: 'python/hash/0x13d625ff',
          snapshot: "<class 'ray.exceptions.RayTaskError'>",
        },
        sys: {
          kind: 'object',
          type: 'builtins.module',
          id: 'python/id/0x10076cea0',
          hash: 'python/hash/0x10076cea',
          snapshot: "<module 'sys' (built-in)>",
        },
      },
      retval: {
        kind: 'sequence',
        type: 'builtins.list',
        id: 'python/id/0x2b2ccab00',
        snapshot: '[]',
        values: [],
      },
      filename:
        '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/worker.py',
      firstlineno: 2439,
      source:
        '@PublicAPI\n@client_mode_hook\ndef get(\n    object_refs: Union[ray.ObjectRef, Sequence[ray.ObjectRef]],\n    *,\n    timeout: Optional[float] = None,\n) -> Union[Any, List[Any]]:\n    """Get a remote object or a list of remote objects from the object store.\n\n    This method blocks until the object corresponding to the object ref is\n    available in the local object store. If this object is not in the local\n    object store, it will be shipped from an object store that has it (once the\n    object has been created). If object_refs is a list, then the objects\n    corresponding to each object in the list will be returned.\n\n    Ordering for an input list of object refs is preserved for each object\n    returned. That is, if an object ref to A precedes an object ref to B in the\n    input list, then A will precede B in the returned list.\n\n    This method will issue a warning if it\'s running inside async context,\n    you can use ``await object_ref`` instead of ``ray.get(object_ref)``. For\n    a list of object refs, you can use ``await asyncio.gather(*object_refs)``.\n\n    Related patterns and anti-patterns:\n\n    - :doc:`/ray-core/patterns/ray-get-loop`\n    - :doc:`/ray-core/patterns/unnecessary-ray-get`\n    - :doc:`/ray-core/patterns/ray-get-submission-order`\n    - :doc:`/ray-core/patterns/ray-get-too-many-objects`\n\n\n    Args:\n        object_refs: Object ref of the object to get or a list of object refs\n            to get.\n        timeout (Optional[float]): The maximum amount of time in seconds to\n            wait before returning. Set this to None will block until the\n            corresponding object becomes available. Setting ``timeout=0`` will\n            return the object immediately if it\'s available, else raise\n            GetTimeoutError in accordance with the above docstring.\n\n    Returns:\n        A Python object or a list of Python objects.\n\n    Raises:\n        GetTimeoutError: A GetTimeoutError is raised if a timeout is set and\n            the get takes longer than timeout to return.\n        Exception: An exception is raised if the task that created the object\n            or that created one of the objects raised an exception.\n    """\n    worker = global_worker\n    worker.check_connected()\n\n    if hasattr(worker, "core_worker") and worker.core_worker.current_actor_is_asyncio():\n        global blocking_get_inside_async_warned\n        if not blocking_get_inside_async_warned:\n            logger.warning(\n                "Using blocking ray.get inside async actor. "\n                "This blocks the event loop. Please use `await` "\n                "on object ref with asyncio.gather if you want to "\n                "yield execution to the event loop instead."\n            )\n            blocking_get_inside_async_warned = True\n\n    with profiling.profile("ray.get"):\n        # TODO(sang): Should make StreamingObjectRefGenerator\n        # compatible to ray.get for dataset.\n        if isinstance(object_refs, StreamingObjectRefGenerator):\n            return object_refs\n\n        is_individual_id = isinstance(object_refs, ray.ObjectRef)\n        if is_individual_id:\n            object_refs = [object_refs]\n\n        if not isinstance(object_refs, list):\n            raise ValueError(\n                "\'object_refs\' must either be an ObjectRef or a list of ObjectRefs."\n            )\n\n        # TODO(ujvl): Consider how to allow user to retrieve the ready objects.\n        values, debugger_breakpoint = worker.get_objects(object_refs, timeout=timeout)\n        for i, value in enumerate(values):\n            if isinstance(value, RayError):\n                if isinstance(value, ray.exceptions.ObjectLostError):\n                    worker.core_worker.dump_object_store_memory_usage()\n                if isinstance(value, RayTaskError):\n                    raise value.as_instanceof_cause()\n                else:\n                    raise value\n\n        if is_individual_id:\n            values = values[0]\n\n        if debugger_breakpoint != b"":\n            frame = sys._getframe().f_back\n            rdb = ray.util.pdb._connect_ray_pdb(\n                host=None,\n                port=None,\n                patch_stdstreams=False,\n                quiet=None,\n                breakpoint_uuid=debugger_breakpoint.decode()\n                if debugger_breakpoint\n                else None,\n                debugger_external=worker.ray_debugger_external,\n            )\n            rdb.set_trace(frame=frame)\n\n        return values\n',
      docstring:
        "Get a remote object or a list of remote objects from the object store.\n\nThis method blocks until the object corresponding to the object ref is\navailable in the local object store. If this object is not in the local\nobject store, it will be shipped from an object store that has it (once the\nobject has been created). If object_refs is a list, then the objects\ncorresponding to each object in the list will be returned.\n\nOrdering for an input list of object refs is preserved for each object\nreturned. That is, if an object ref to A precedes an object ref to B in the\ninput list, then A will precede B in the returned list.\n\nThis method will issue a warning if it's running inside async context,\nyou can use ``await object_ref`` instead of ``ray.get(object_ref)``. For\na list of object refs, you can use ``await asyncio.gather(*object_refs)``.\n\nRelated patterns and anti-patterns:\n\n- :doc:`/ray-core/patterns/ray-get-loop`\n- :doc:`/ray-core/patterns/unnecessary-ray-get`\n- :doc:`/ray-core/patterns/ray-get-submission-order`\n- :doc:`/ray-core/patterns/ray-get-too-many-objects`\n\n\nArgs:\n    object_refs: Object ref of the object to get or a list of object refs\n        to get.\n    timeout (Optional[float]): The maximum amount of time in seconds to\n        wait before returning. Set this to None will block until the\n        corresponding object becomes available. Setting ``timeout=0`` will\n        return the object immediately if it's available, else raise\n        GetTimeoutError in accordance with the above docstring.\n\nReturns:\n    A Python object or a list of Python objects.\n\nRaises:\n    GetTimeoutError: A GetTimeoutError is raised if a timeout is set and\n        the get takes longer than timeout to return.\n    Exception: An exception is raised if the task that created the object\n        or that created one of the objects raised an exception.",
    },
    stackframes: [
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/worker.py',
        lineno: 2439,
        func: 'get',
        code: '@PublicAPI\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/client_mode_hook.py',
        lineno: 103,
        func: 'wrapper',
        code: '        return func(*args, **kwargs)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ray/_private/auto_init_hook.py',
        lineno: 24,
        func: 'auto_init_wrapper',
        code: '        return fn(*args, **kwargs)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
        lineno: 97,
        func: '_resolve_args',
        code: '    actual_vals = ray.get(list(refs.values()))\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/distributed/primitive.py',
        lineno: 145,
        func: 'remote',
        code: '        args, kwargs = _resolve_args(*args, **kwargs)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/spu.py',
        lineno: 1693,
        func: 'init',
        code: '                sfd.remote(SPURuntime)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/secretflow/device/device/spu.py',
        lineno: 1687,
        func: '__init__',
        code: '        self.init()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/pyprojects/secretnote/src/secretnote/formal/locations/spu.py',
        lineno: 41,
        func: 'reify',
        code: '        return SPU(\n',
      },
      {
        filename: 'presets/millionaires/_world.py',
        lineno: 51,
        func: '<module>',
        code: 'spu = sym_spu.reify(\n',
      },
      {
        filename: 'Cell In[3]',
        lineno: 34,
        func: '<module>',
        code: '        exec(_world, globals())\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3508,
        func: 'run_code',
        code: '                    exec(code_obj, self.user_global_ns, self.user_ns)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3448,
        func: 'run_ast_nodes',
        code: '                if await self.run_code(code, result, async_=asy):\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3269,
        func: 'run_cell_async',
        code: '                has_raised = await self.run_ast_nodes(code_ast.body, cell_name,\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/async_helpers.py',
        lineno: 129,
        func: '_pseudo_sync_runner',
        code: '        coro.send(None)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3064,
        func: '_run_cell',
        code: '            result = runner(coro)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/IPython/core/interactiveshell.py',
        lineno: 3009,
        func: 'run_cell',
        code: '            result = self._run_cell(\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/zmqshell.py',
        lineno: 546,
        func: 'run_cell',
        code: '        return super().run_cell(*args, **kwargs)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/ipkernel.py',
        lineno: 422,
        func: 'do_execute',
        code: '                    res = shell.run_cell(\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 740,
        func: 'execute_request',
        code: '            reply_content = await reply_content\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 412,
        func: 'dispatch_shell',
        code: '                    await result\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 505,
        func: 'process_one',
        code: '        await dispatch(*args)\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelbase.py',
        lineno: 516,
        func: 'dispatch_queue',
        code: '                await self.process_one()\n',
      },
      {
        filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/events.py',
        lineno: 81,
        func: '_run',
        code: '            self._context.run(self._callback, *self._args)\n',
      },
      {
        filename:
          '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
        lineno: 1859,
        func: '_run_once',
        code: '                handle._run()\n',
      },
      {
        filename:
          '~/.rye/py/cpython@3.8.17/install/lib/python3.8/asyncio/base_events.py',
        lineno: 570,
        func: 'run_forever',
        code: '                self._run_once()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/tornado/platform/asyncio.py',
        lineno: 195,
        func: 'start',
        code: '        self.asyncio_loop.run_forever()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel/kernelapp.py',
        lineno: 736,
        func: 'start',
        code: '                self.io_loop.start()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/traitlets/config/application.py',
        lineno: 1051,
        func: 'launch_instance',
        code: '        app.start()\n',
      },
      {
        filename:
          '~/developer/git/secretflow/notebook/.venv/lib/python3.8/site-packages/ipykernel_launcher.py',
        lineno: 17,
        func: '<module>',
        code: '    app.launch_new_instance()\n',
      },
      {
        filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
        lineno: 87,
        func: '_run_code',
        code: '    exec(code, run_globals)\n',
      },
      {
        filename: '~/.rye/py/cpython@3.8.17/install/lib/python3.8/runpy.py',
        lineno: 194,
        func: '_run_module_as_main',
        code: '    return _run_code(code, main_globals, None,\n',
      },
    ],
  },
  inner_calls: [],
};
